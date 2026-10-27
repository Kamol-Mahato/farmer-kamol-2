"""
Farmer Kamol — Farm Video Editor
সারাদিনের ক্লিপ → অটো সকাল-সন্ধ্যা সর্ট → স্পিড → সফট ট্রানজিশন → VO → ১৬:৯ + ৯:১৬
Offline · FFmpeg · Streamlit
"""

import os
import time
import shutil
import logging
import subprocess
from pathlib import Path
from datetime import datetime
from typing import Optional, List

import streamlit as st

# ── PATHS ────────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "Output")
TEMP_DIR = os.path.join(BASE_DIR, "Temp")

# Logo: public/uploads/logo.png
_LOGO_CANDIDATES = [
    os.path.join(BASE_DIR, "..", "uploads", "logo.png"),
    os.path.join(BASE_DIR, "uploads", "logo.png"),
    os.path.join(BASE_DIR, "..", "..", "public", "uploads", "logo.png"),
]
LOGO_PATH = next((p for p in _LOGO_CANDIDATES if os.path.exists(p)), None)

_pf = os.path.join(BASE_DIR, "ffmpeg", "bin", "ffmpeg.exe")
_pp = os.path.join(BASE_DIR, "ffmpeg", "bin", "ffprobe.exe")
FFMPEG = _pf if os.path.exists(_pf) else "ffmpeg"
FFPROBE = _pp if os.path.exists(_pp) else "ffprobe"

DEFAULT_SPEED = 1.25
MIN_SPEED = 1.0
MAX_SPEED = 1.5
TRANSITION_SEC = 0.5
REELS_W, REELS_H = 1080, 1920

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("FarmVideo")


def ensure_dirs():
    for d in (OUTPUT_DIR, TEMP_DIR):
        Path(d).mkdir(parents=True, exist_ok=True)


def cleanup_temp(keep: Optional[str] = None):
    try:
        for f in Path(TEMP_DIR).rglob("*"):
            if f.is_file():
                if keep and os.path.abspath(str(f)) == os.path.abspath(keep):
                    continue
                try:
                    f.unlink()
                except Exception:
                    pass
    except Exception as e:
        log.warning("Temp cleanup failed: %s", e)


def run_ff(cmd: list, desc: str = "") -> tuple[bool, str]:
    log.info("[%s] %s", desc, " ".join(str(x) for x in cmd[:14]) + ("..." if len(cmd) > 14 else ""))
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=7200)
        if r.returncode != 0:
            err = (r.stderr or r.stdout or "Unknown ffmpeg error")[-3000:]
            log.error("%s\n%s", desc, err)
            return False, err
        return True, r.stderr or ""
    except subprocess.TimeoutExpired:
        return False, "Timeout"
    except FileNotFoundError:
        return False, "ffmpeg/ffprobe পাওয়া যায়নি"
    except Exception as e:
        return False, str(e)


def probe_duration(path: str) -> float:
    cmd = [FFPROBE, "-v", "error", "-show_entries", "format=duration",
           "-of", "default=noprint_wrappers=1:nokey=1", path]
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        if r.returncode == 0 and r.stdout.strip():
            return float(r.stdout.strip())
    except Exception:
        pass
    return 0.0


def probe_creation_time(path: str) -> float:
    cmd = [FFPROBE, "-v", "quiet",
           "-show_entries", "format_tags=creation_time:stream_tags=creation_time",
           "-of", "default=noprint_wrappers=1:nokey=1", path]
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        for line in (r.stdout or "").strip().splitlines():
            line = line.strip()
            if not line:
                continue
            try:
                return datetime.fromisoformat(line.replace("Z", "+00:00")).timestamp()
            except Exception:
                pass
            for fmt in ("%Y-%m-%dT%H:%M:%S.%fZ", "%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%d %H:%M:%S"):
                try:
                    return datetime.strptime(line[:26].rstrip("Z"), fmt.replace("Z", "").replace(".%f", "")).timestamp()
                except Exception:
                    continue
    except Exception:
        pass
    try:
        return os.path.getmtime(path)
    except Exception:
        return 0.0


def save_upload(uploaded, dest_dir: str) -> str:
    Path(dest_dir).mkdir(parents=True, exist_ok=True)
    dest = os.path.join(dest_dir, uploaded.name)
    with open(dest, "wb") as f:
        f.write(uploaded.getbuffer())
    return dest


def tmp_path(prefix: str, ext: str) -> str:
    return os.path.join(TEMP_DIR, f"{prefix}_{int(time.time() * 1000)}_{os.getpid()}{ext}")


def check_ffmpeg() -> bool:
    ok, _ = run_ff([FFMPEG, "-version"], "version")
    return ok


def build_atempo_chain(speed: float) -> str:
    parts = []
    sp = float(speed)
    if sp <= 0:
        sp = 1.0
    while sp > 2.0 + 1e-6:
        parts.append("atempo=2.0")
        sp /= 2.0
    while sp < 0.5 - 1e-6:
        parts.append("atempo=0.5")
        sp /= 0.5
    parts.append(f"atempo={sp:.4f}")
    return ",".join(parts)


# ── স্টেবিলাইজ + রেজোলিউশন ───────────────────────────────────────────────────
STAB_LEVELS = {"হালকা": 10, "মাঝারি": 20, "জোরালো": 35}   # smoothing (ফ্রেম সংখ্যা)
RES_OPTIONS = {"১০৮০p (Full HD)": (1920, 1080), "২কে (১৪৪০p)": (2560, 1440)}

_VIDSTAB_OK: Optional[bool] = None


def has_vidstab() -> bool:
    global _VIDSTAB_OK
    if _VIDSTAB_OK is None:
        try:
            r = subprocess.run([FFMPEG, "-hide_banner", "-filters"],
                               capture_output=True, text=True, timeout=30)
            _VIDSTAB_OK = "vidstabdetect" in (r.stdout or "")
        except Exception:
            _VIDSTAB_OK = False
    return _VIDSTAB_OK


def stabilize_chain(src: str, pre: str, idx: int, smooth: int) -> str:
    """ধাপ ১: কাঁপুনি মাপে। ধাপ ২-এর ফিল্টার টেক্সট ফেরত দেয় (ব্যর্থ হলে খালি)।"""
    if not has_vidstab():
        log.warning("vidstab এই FFmpeg-এ নেই — স্টেবিলাইজ বাদ")
        return ""
    trf = tmp_path(f"stab{idx:03d}", ".trf")
    esc = trf.replace("\\", "/").replace(":", "\\:")
    cmd = [FFMPEG, "-y", "-i", src, "-vf",
           f"{pre},vidstabdetect=shakiness=6:accuracy=15:result={esc}",
           "-an", "-f", "null", "-"]
    ok, _ = run_ff(cmd, f"stab-detect-{idx}")
    if not ok or not os.path.exists(trf):
        return ""
    return (f"vidstabtransform=input={esc}:smoothing={smooth}:zoom=0:optzoom=1:interpol=bicubic,"
            "unsharp=5:5:0.6:3:3:0.3,")


def process_clip(
    src: str,
    speed: float,
    idx: int,
    keep_audio: bool = False,
    out_w: int = 1920,
    out_h: int = 1080,
    stab_smooth: int = 0,
) -> Optional[str]:
    out = tmp_path(f"clip{idx:03d}", ".mp4")
    pre = f"scale={out_w}:{out_h}:force_original_aspect_ratio=decrease,fps=30"
    stab_chain = stabilize_chain(src, pre, idx, stab_smooth) if stab_smooth > 0 else ""
    vf = (
        f"{pre},{stab_chain}"
        f"pad={out_w}:{out_h}:(ow-iw)/2:(oh-ih)/2:black,setsar=1"
    )
    if abs(speed - 1.0) > 0.01:
        vf += f",setpts=PTS/{speed}"

    cmd = [FFMPEG, "-y", "-i", src, "-vf", vf]
    if keep_audio:
        if abs(speed - 1.0) > 0.01:
            cmd += ["-af", build_atempo_chain(speed), "-c:a", "aac", "-b:a", "192k"]
        else:
            cmd += ["-c:a", "aac", "-b:a", "192k"]
    else:
        cmd += ["-an"]
    cmd += ["-c:v", "libx264", "-preset", "veryfast", "-crf", "20", out]

    ok, err = run_ff(cmd, f"process-clip-{idx}")
    if not ok or not os.path.exists(out):
        log.error("process_clip %s failed: %s", idx, (err or "")[:800])
        return None
    if probe_duration(out) < 0.05:
        return None
    return out


def concat_with_fade(paths: List[str], fade_sec: float = TRANSITION_SEC) -> Optional[str]:
    if not paths:
        return None
    if len(paths) == 1:
        out = tmp_path("joined", ".mp4")
        shutil.copy2(paths[0], out)
        return out

    durs = [probe_duration(p) for p in paths]
    if any(d <= 0 for d in durs):
        return concat_hard(paths)

    current = paths[0]
    offset = max(0.0, durs[0] - fade_sec)

    for i in range(1, len(paths)):
        out = tmp_path(f"xfade{i}", ".mp4")
        cmd = [
            FFMPEG, "-y",
            "-i", current,
            "-i", paths[i],
            "-filter_complex",
            f"[0:v][1:v]xfade=transition=fade:duration={fade_sec}:offset={offset:.3f}[v]",
            "-map", "[v]",
            "-an",
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
            out,
        ]
        ok, err = run_ff(cmd, f"xfade-{i}")
        if not ok:
            log.warning("xfade failed, falling back to hard concat: %s", (err or "")[:400])
            return concat_hard(paths)
        current = out
        new_dur = probe_duration(current)
        offset = max(0.0, new_dur - fade_sec)

    return current


def concat_hard(paths: List[str]) -> Optional[str]:
    lst = tmp_path("list", ".txt")
    with open(lst, "w", encoding="utf-8") as f:
        for p in paths:
            safe = os.path.abspath(p).replace("\\", "/").replace("'", "'\\''")
            f.write(f"file '{safe}'\n")
    out = tmp_path("hardjoin", ".mp4")
    cmd = [
        FFMPEG, "-y", "-f", "concat", "-safe", "0", "-i", lst,
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-an", out,
    ]
    ok, _ = run_ff(cmd, "hard-concat")
    return out if ok and os.path.exists(out) else None


def burn_logo(video: str, logo_path: Optional[str]) -> Optional[str]:
    if not logo_path or not os.path.exists(logo_path):
        return video
    out = tmp_path("branded", ".mp4")
    lw = max(60, int(120 * (probe_size(video)[0] or 1920) / 1920))
    cmd = [
        FFMPEG, "-y",
        "-i", video,
        "-i", logo_path,
        "-filter_complex",
        f"[1:v]scale={lw}:-1[lg];[0:v][lg]overlay=W-w-20:20[v]",
        "-map", "[v]",
        "-an",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
        out,
    ]
    ok, _ = run_ff(cmd, "logo")
    return out if ok and os.path.exists(out) else video


def mix_voiceover(video: str, vo_path: Optional[str]) -> Optional[str]:
    if not vo_path or not os.path.exists(vo_path):
        return video
    out = tmp_path("with_vo", ".mp4")
    vdur = probe_duration(video)
    if vdur <= 0:
        return video
    cmd = [
        FFMPEG, "-y",
        "-i", video,
        "-i", vo_path,
        "-filter_complex",
        "[1:a]highpass=f=80,volume=1.2,aformat=sample_rates=44100:channel_layouts=stereo[a]",
        "-map", "0:v", "-map", "[a]",
        "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
        "-t", f"{vdur:.3f}",
        out,
    ]
    ok, _ = run_ff(cmd, "mix-vo")
    return out if ok and os.path.exists(out) else video


def export_9x16(video_16x9: str) -> Optional[str]:
    day_dir = os.path.join(OUTPUT_DIR, datetime.now().strftime("%Y-%m-%d"))
    Path(day_dir).mkdir(parents=True, exist_ok=True)
    out = os.path.join(day_dir, f"reels_{datetime.now().strftime('%H%M%S')}.mp4")
    vf = f"scale=-1:{REELS_H},crop={REELS_W}:{REELS_H}:(in_w-{REELS_W})/2:0,setsar=1"
    cmd = [
        FFMPEG, "-y", "-i", video_16x9,
        "-vf", vf,
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
        "-c:a", "copy",
        out,
    ]
    ok, _ = run_ff(cmd, "9x16")
    return out if ok else None


def save_final(video: str, suffix: str = "16x9") -> str:
    day_dir = os.path.join(OUTPUT_DIR, datetime.now().strftime("%Y-%m-%d"))
    Path(day_dir).mkdir(parents=True, exist_ok=True)
    out = os.path.join(day_dir, f"farm_{suffix}_{datetime.now().strftime('%H%M%S')}.mp4")
    shutil.copy2(video, out)
    return out


# ── DOWN BAR (উপরের লেয়ার) ──────────────────────────────────────────────────
# ডাউন বার ভিডিও: ১৯২০×২৫৬, pill আকার — pill ঠিক x=140 থেকে ১৬৪০px চওড়া
BAR_PILL_X, BAR_PILL_W, BAR_SRC_H = 140, 1640, 256
BAR_ALIGN = {"বামে": "left", "মাঝে": "center", "ডানে": "right"}


def parse_mmss(txt: str) -> float:
    """'3:00' → 180, '4:50' → 290, '90' → 90 সেকেন্ড।"""
    try:
        parts = [float(p) for p in txt.strip().split(":")]
    except ValueError:
        return 0.0
    total = 0.0
    for p in parts:
        total = total * 60 + p
    return max(0.0, total)


def probe_size(path: str) -> tuple:
    cmd = [FFPROBE, "-v", "error", "-select_streams", "v:0",
           "-show_entries", "stream=width,height", "-of", "csv=p=0", path]
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        w, h = r.stdout.strip().split(",")[:2]
        return int(w), int(h)
    except Exception:
        return 0, 0


def make_bar_mask(path: str):
    """pill আকারের নরম কিনারার মাস্ক বানায় (কোণার কালো অংশ কেটে ফেলতে)।"""
    from PIL import Image, ImageDraw
    ss, ins = 4, 8
    im = Image.new("L", (BAR_PILL_W * ss, BAR_SRC_H * ss), 0)
    ImageDraw.Draw(im).rounded_rectangle(
        [ins, ins, BAR_PILL_W * ss - 1 - ins, BAR_SRC_H * ss - 1 - ins],
        radius=BAR_SRC_H * ss // 2 - ins, fill=255,
    )
    im.resize((BAR_PILL_W, BAR_SRC_H), Image.LANCZOS).save(path)


def apply_bar(video: str, cfg: Optional[dict], target: str = "16x9") -> str:
    """ভিডিওর উপরে ডাউন বার লেয়ার বসায়। ব্যর্থ হলে আসল ভিডিও ফেরত দেয়।"""
    if not cfg or not cfg.get("path") or not os.path.exists(cfg["path"]):
        return video
    bar_path = cfg["path"]
    vdur, bdur = probe_duration(video), probe_duration(bar_path)
    if vdur <= 0 or bdur <= 0:
        return video
    sw, sh = probe_size(bar_path)
    if (sw, sh) != (1920, BAR_SRC_H):
        st.warning(f"ডাউন বারের সাইজ {sw}×{sh}; ১৯২০×{BAR_SRC_H} হলে সবচেয়ে ভালো আসে।")

    secs = float(cfg.get("secs", 0))
    if cfg.get("mode") == "end":
        start = vdur - bdur - secs      # শেষের X সেকেন্ড আগে বার শেষ হবে
    else:
        start = secs                    # শুরু থেকে X সেকেন্ডে বার আসবে
    start = max(0.0, min(start, max(0.0, vdur - 1.0)))

    if target == "9x16":
        bw, mb, ms = 1000, 260, 40      # রিলসের নিচের বাটনের উপরে
    else:
        k = (probe_size(video)[0] or 1920) / 1920
        bw, mb, ms = int(BAR_PILL_W * float(cfg.get("scale", 1.0)) * k), int(40 * k), int(40 * k)
    bw -= bw % 2
    x = {"left": f"{ms}", "center": "(W-w)/2", "right": f"W-w-{ms}"}.get(cfg.get("align", "center"), "(W-w)/2")

    mask = tmp_path("barmask", ".png")
    make_bar_mask(mask)
    out = tmp_path(f"bar_{target}", ".mp4")
    fc = (
        f"[1:v]crop={BAR_PILL_W}:{BAR_SRC_H}:{BAR_PILL_X}:0,format=yuva420p[b0];"
        f"[2:v]format=gray[m];[b0][m]alphamerge[b1];"
        f"[b1]scale={bw}:-2:flags=lanczos,setpts=PTS-STARTPTS+{start:.3f}/TB[b2];"
        f"[0:v][b2]overlay=x={x}:y=H-h-{mb}:eof_action=pass:format=auto[v]"
    )
    cmd = [
        FFMPEG, "-y",
        "-i", video,
        "-i", bar_path,
        "-loop", "1", "-t", f"{bdur:.3f}", "-i", mask,
        "-filter_complex", fc,
        "-map", "[v]", "-map", "0:a?",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p",
        "-c:a", "copy",
        "-t", f"{vdur:.3f}",
        out,
    ]
    ok, _ = run_ff(cmd, f"downbar-{target}")
    return out if ok and os.path.exists(out) else video


def run_pipeline(
    clips: list,
    speed: float,
    vo_path: Optional[str],
    do_16x9: bool,
    do_9x16: bool,
    status,
    bar,
    bar_cfg: Optional[dict] = None,
    res_key: str = "১০৮০p (Full HD)",
    stab_level: str = "মাঝারি",
):
    ensure_dirs()
    n = len(clips)
    processed = []
    out_w, out_h = RES_OPTIONS.get(res_key, (1920, 1080))

    for i, c in enumerate(clips):
        status.write(f"ক্লিপ {i+1}/{n}: {c['name']}" + (" · স্টেবিলাইজ হচ্ছে (সময় লাগবে)" if c.get("stab") else ""))
        bar.progress(min(0.7, (i + 0.5) / max(n + 2, 1)))
        p = process_clip(
            c["path"],
            speed,
            i,
            keep_audio=bool(c.get("keep_audio", False)),
            out_w=out_w,
            out_h=out_h,
            stab_smooth=STAB_LEVELS.get(stab_level, 20) if c.get("stab") else 0,
        )
        if not p:
            st.error(f"ক্লিপ ফেল: `{c['name']}`")
            return None, None
        processed.append(p)

    status.write("ট্রানজিশন দিয়ে জোড়া হচ্ছে...")
    bar.progress(0.75)
    joined = concat_with_fade(processed, TRANSITION_SEC)
    if not joined:
        st.error("কনক্যাট ব্যর্থ")
        return None, None

    status.write("লোগো যোগ হচ্ছে...")
    bar.progress(0.82)
    branded = burn_logo(joined, LOGO_PATH) or joined

    status.write("ভয়েস ওভার মিক্স হচ্ছে...")
    bar.progress(0.90)
    final = mix_voiceover(branded, vo_path) or branded

    out_16 = None
    out_9 = None
    if do_16x9:
        if bar_cfg:
            status.write("ডাউন বার বসছে (১৬:৯)...")
        out_16 = save_final(apply_bar(final, bar_cfg, "16x9"), "16x9")
    if do_9x16:
        status.write("৯:১৬ বানানো হচ্ছে...")
        bar.progress(0.95)
        r = export_9x16(final)
        if r and bar_cfg:
            status.write("ডাউন বার বসছে (৯:১৬)...")
            with_bar = apply_bar(r, bar_cfg, "9x16")
            if with_bar != r:
                shutil.move(with_bar, r)
        if r:
            out_9 = r

    bar.progress(1.0)
    status.write("✅ শেষ")
    cleanup_temp(keep=out_16 or out_9)
    return out_16, out_9


def main():
    st.set_page_config(page_title="Farmer Kamol Video Editor", page_icon="🌾", layout="wide")
    st.markdown(
        """
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&display=swap');
        html, body, [class*="css"] { font-family: 'Hind Siliguri', sans-serif !important; }
        .stButton > button { border-radius: 8px; }
        </style>
        """,
        unsafe_allow_html=True,
    )
    ensure_dirs()

    if "clips" not in st.session_state:
        st.session_state.clips = []

    st.title("🌾 Farmer Kamol — ভিডিও এডিটর")
    st.caption("সারাদিনের ক্লিপ → অটো সকাল→সন্ধ্যা → স্পিড → সফট ট্রানজিশন → VO → ১৬:৯ + ৯:১৬")

    if not check_ffmpeg():
        st.error("FFmpeg পাওয়া যায়নি। সিস্টেমে ffmpeg ইনস্টল করুন অথবা `ffmpeg/bin/` ফোল্ডারে রাখুন।")
        st.stop()

    if LOGO_PATH:
        st.sidebar.success(f"লোগো: `{os.path.basename(LOGO_PATH)}`")
    else:
        st.sidebar.warning("logo.png পাওয়া যায়নি — লোগো ছাড়াই চলবে")

    st.header("১. ক্লিপ আপলোড")
    ups = st.file_uploader(
        "২০–৩০টা ভিডিও ক্লিপ একসাথে সিলেক্ট করুন",
        type=["mp4", "mov", "mkv", "avi", "m4v"],
        accept_multiple_files=True,
        key="uploader",
    )
    col_a, col_b = st.columns(2)
    with col_a:
        if ups and st.button("ক্লিপ যোগ + সময় অনুসারে সর্ট", type="primary"):
            batch = os.path.join(TEMP_DIR, "uploads")
            Path(batch).mkdir(parents=True, exist_ok=True)
            for u in ups:
                p = save_upload(u, batch)
                ts = probe_creation_time(p)
                st.session_state.clips.append({
                    "path": p,
                    "name": u.name,
                    "ts": ts,
                    "keep_audio": False,
                })
            st.session_state.clips.sort(key=lambda c: c["ts"])
            st.success(f"{len(ups)} টি ক্লিপ যোগ + সকাল→সন্ধ্যা সর্ট হয়েছে")
            st.rerun()
    with col_b:
        if st.session_state.clips and st.button("সব ক্লিপ মুছুন"):
            st.session_state.clips = []
            cleanup_temp()
            st.rerun()

    if st.session_state.clips:
        st.subheader(f"ক্লিপ তালিকা ({len(st.session_state.clips)} টি) — সকাল → সন্ধ্যা")
        st.caption("সব ক্লিপ ডিফল্ট মিউট। যেকোনো একটা আনমিউট করতে পারেন। ↑↓ দিয়ে অর্ডার বদলান।")

        total_raw = 0.0
        for i, c in enumerate(st.session_state.clips):
            d = probe_duration(c["path"])
            total_raw += d
            cols = st.columns([0.05, 0.26, 0.14, 0.08, 0.12, 0.13, 0.07, 0.07, 0.08])
            cols[0].write(f"**{i+1}**")
            cols[1].write(c["name"][:28] + ("…" if len(c["name"]) > 28 else ""))
            try:
                cols[2].write(datetime.fromtimestamp(c["ts"]).strftime("%d/%m %H:%M"))
            except Exception:
                cols[2].write("—")
            cols[3].write(f"{d:.0f}s")
            keep = cols[4].checkbox("🔊 আনমিউট", value=c.get("keep_audio", False), key=f"aud{i}")
            st.session_state.clips[i]["keep_audio"] = keep
            stab = cols[5].checkbox("🎥 স্টেবিলাইজ", value=c.get("stab", False), key=f"stab_{c['path']}")
            st.session_state.clips[i]["stab"] = stab
            if cols[6].button("↑", key=f"up{i}", disabled=(i == 0)):
                st.session_state.clips[i], st.session_state.clips[i-1] = (
                    st.session_state.clips[i-1], st.session_state.clips[i]
                )
                st.rerun()
            if cols[7].button("↓", key=f"dn{i}", disabled=(i == len(st.session_state.clips)-1)):
                st.session_state.clips[i], st.session_state.clips[i+1] = (
                    st.session_state.clips[i+1], st.session_state.clips[i]
                )
                st.rerun()
            if cols[8].button("✕", key=f"del{i}"):
                st.session_state.clips.pop(i)
                st.rerun()

        speed_preview = st.session_state.get("speed", DEFAULT_SPEED)
        st.info(
            f"মোট raw ≈ **{total_raw/60:.1f} মিনিট** → "
            f"স্পিড {speed_preview}x পরে ≈ **{total_raw/speed_preview/60:.1f} মিনিট**"
        )

    st.header("২. সেটিংস")
    c1, c2, c3 = st.columns(3)
    with c1:
        speed = st.slider("স্পিড (সব ক্লিপে)", MIN_SPEED, MAX_SPEED, DEFAULT_SPEED, 0.05)
        st.session_state["speed"] = speed
    with c2:
        st.write("ট্রানজিশন")
        st.success(f"Soft Fade · {TRANSITION_SEC}s (চোখে লাগবে না)")
    with c3:
        st.write("লোগো")
        if LOGO_PATH:
            st.success("logo.png · উপরে ডানে ফিক্সড")
        else:
            st.warning("লোগো নেই")

    st.header("৩. ভয়েস ওভার")
    vo_file = st.file_uploader("Voice Over অডিও (ঐচ্ছিক)", type=["mp3", "wav", "m4a", "aac"], key="vo")
    vo_path = None
    if vo_file:
        vo_path = save_upload(vo_file, TEMP_DIR)
        st.session_state["vo_path"] = vo_path
        st.success(f"VO লোড: {vo_file.name}")
    else:
        vo_path = st.session_state.get("vo_path")

    st.header("৪. ডাউন বার (ঐচ্ছিক)")
    bar_file = st.file_uploader("ডাউন বার ভিডিও আপলোড করুন", type=["mp4", "mov", "mkv"], key="downbar")
    bar_cfg = None
    if bar_file:
        d1, d2, d3, d4 = st.columns(4)
        with d1:
            where = st.radio("কোথায় আসবে", ["শুরু থেকে", "শেষ থেকে"], horizontal=True)
        with d2:
            t_txt = st.text_input(
                "কত মিনিটে আসবে (যেমন 3:00)" if where == "শুরু থেকে" else "শেষের কত আগে বার শেষ হবে (যেমন 0:10)",
                value="0:00",
            )
            secs = parse_mmss(t_txt)
        with d3:
            align_bn = st.selectbox("পজিশন", list(BAR_ALIGN.keys()), index=1)
        with d4:
            bar_scale = st.slider("সাইজ (১৬:৯)", 0.4, 1.0, 1.0, 0.05)
        bar_cfg = {
            "path": save_upload(bar_file, TEMP_DIR),
            "mode": "start" if where == "শুরু থেকে" else "end",
            "secs": secs,
            "align": BAR_ALIGN[align_bn],
            "scale": bar_scale,
        }

    st.header("৫. এক্সপোর্ট")
    do_16 = st.checkbox("১৬:৯ (YouTube)", value=True)
    do_9 = st.checkbox("৯:১৬ (Reels / Shorts)", value=True)
    r1, r2 = st.columns(2)
    with r1:
        res_key = st.selectbox("১৬:৯ রেজোলিউশন", list(RES_OPTIONS.keys()), index=0)
    with r2:
        stab_level = st.selectbox("স্টেবিলাইজ মাত্রা (যে ক্লিপে 🎥 টিক দেওয়া)", list(STAB_LEVELS.keys()), index=1)
    if any(c.get("stab") for c in st.session_state.clips) and not has_vidstab():
        st.warning("এই সার্ভারের FFmpeg-এ স্টেবিলাইজ ফিল্টার নেই — টিক দেওয়া ক্লিপ আগের মতোই যাবে।")

    n = len(st.session_state.clips)
    if n == 0:
        st.warning("আগে ক্লিপ আপলোড করুন।")
    elif not (do_16 or do_9):
        st.warning("কমপক্ষে একটা ফরম্যাট সিলেক্ট করুন।")
    elif st.button("🎬 ভিডিও তৈরি করুন", type="primary", use_container_width=True):
        status = st.empty()
        bar = st.progress(0)
        out16, out9 = run_pipeline(
            clips=st.session_state.clips,
            speed=float(speed),
            vo_path=vo_path,
            do_16x9=do_16,
            do_9x16=do_9,
            status=status,
            bar=bar,
            bar_cfg=bar_cfg,
            res_key=res_key,
            stab_level=stab_level,
        )
        if out16:
            st.success(f"১৬:৯ → `{out16}`")
            st.video(out16)
            with open(out16, "rb") as f:
                st.download_button("⬇️ ১৬:৯ ডাউনলোড", f, file_name=os.path.basename(out16), mime="video/mp4")
        if out9:
            st.success(f"৯:১৬ → `{out9}`")
            st.video(out9)
            with open(out9, "rb") as f:
                st.download_button("⬇️ ৯:১৬ ডাউনলোড", f, file_name=os.path.basename(out9), mime="video/mp4")
        if not out16 and not out9:
            st.error("রেন্ডার ব্যর্থ। টার্মিনাল লগ চেক করুন।")


if __name__ == "__main__":
    main()
