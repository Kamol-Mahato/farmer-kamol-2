"""
Farmer Kamol — Farm Video Tool (Fixed)
Offline · FFmpeg · Streamlit · Hind Siliguri only
"""

import os
import sys
import time
import shutil
import logging
import subprocess
from pathlib import Path
from datetime import datetime
from typing import Optional

import streamlit as st

# ── PATHS ────────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "Output")
TEMP_DIR = os.path.join(BASE_DIR, "Temp")
FONT_PATH = os.path.join(BASE_DIR, "fonts", "HindSiliguri-Regular.ttf")

_pf = os.path.join(BASE_DIR, "ffmpeg", "bin", "ffmpeg.exe")
_pp = os.path.join(BASE_DIR, "ffmpeg", "bin", "ffprobe.exe")
FFMPEG = _pf if os.path.exists(_pf) else "ffmpeg"
FFPROBE = _pp if os.path.exists(_pp) else "ffprobe"

DEFAULT_SPEED = 1.8
MAX_SPEED = 6.0
TRANSITION_SEC = 0.6
REELS_W, REELS_H = 1080, 1920

RESOLUTIONS = {
    "1080p (1920×1080)": (1920, 1080),
    "1440p / 2K (2560×1440)": (2560, 1440),
    "4K (3840×2160)": (3840, 2160),
}

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("FarmVideo")


def ensure_dirs():
    for d in (OUTPUT_DIR, TEMP_DIR):
        Path(d).mkdir(parents=True, exist_ok=True)


def cleanup_temp(keep: Optional[str] = None):
    """Temp ফাইল মুছে ফেলে (ফাইনাল আউটপুট বাদে)।"""
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
    log.info("[%s] %s", desc, " ".join(cmd[:12]) + ("..." if len(cmd) > 12 else ""))
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=7200)
        if r.returncode != 0:
            err = (r.stderr or r.stdout or "Unknown ffmpeg error")[-3000:]
            log.error("%s\n%s", desc, err)
            return False, err
        return True, r.stderr or ""
    except subprocess.TimeoutExpired:
        return False, "Timeout (২ ঘণ্টার বেশি সময় লেগেছে)"
    except FileNotFoundError:
        return False, "ffmpeg/ffprobe পাওয়া যায়নি"
    except Exception as e:
        return False, str(e)


def probe_duration(path: str) -> float:
    cmd = [
        FFPROBE, "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        path,
    ]
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        if r.returncode == 0 and r.stdout.strip():
            return float(r.stdout.strip())
    except Exception as e:
        log.warning("probe_duration: %s", e)
    return 0.0


def probe_creation_time(path: str) -> float:
    cmd = [
        FFPROBE, "-v", "quiet",
        "-show_entries", "format_tags=creation_time:stream_tags=creation_time",
        "-of", "default=noprint_wrappers=1:nokey=1",
        path,
    ]
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


def ff_path(p: str) -> str:
    """Windows path → ffmpeg filter-safe forward slashes."""
    return os.path.abspath(p).replace("\\", "/")


def escape_drawtext(text: str) -> str:
    return (
        text.replace("\\", "\\\\")
        .replace(":", "\\:")
        .replace("'", "\\'")
        .replace("%", "%%")
        .replace("\n", "\\n")
    )


def escape_font(path: str) -> str:
    return ff_path(path).replace(":", "\\:")


def check_ffmpeg() -> bool:
    ok, _ = run_ff([FFMPEG, "-version"], "version")
    return ok


def has_filter(name: str) -> bool:
    try:
        r = subprocess.run([FFMPEG, "-hide_banner", "-filters"], capture_output=True, text=True, timeout=30)
        return name in (r.stdout or "")
    except Exception:
        return False


def build_atempo_chain(speed: float) -> str:
    """atempo only accepts 0.5–2.0; chain for higher speeds."""
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


# ── STABILIZE (2-pass vidstab, else deshake) ─────────────────────────────────
def stabilize_file(src: str, idx: int) -> str:
    """
    Returns path to stabilized video (or original src if both methods fail).
    Always tries hard — does not silently skip without attempting.
    """
    out = tmp_path(f"stab{idx:03d}", ".mp4")

    if has_filter("vidstabdetect") and has_filter("vidstabtransform"):
        trf = tmp_path(f"trf{idx:03d}", ".trf")
        trf_f = ff_path(trf)
        detect = [
            FFMPEG, "-y", "-i", src,
            "-vf", f"vidstabdetect=shakiness=10:accuracy=15:result={trf_f}",
            "-f", "null", "-",
        ]
        ok1, err1 = run_ff(detect, f"stab-detect-{idx}")
        if ok1 and os.path.exists(trf) and os.path.getsize(trf) > 0:
            transform = [
                FFMPEG, "-y", "-i", src,
                "-vf", (
                    f"vidstabtransform=input={trf_f}:smoothing=30:"
                    f"crop=black:zoom=5:optzoom=1:interpol=linear,unsharp=5:5:0.8:3:3:0.4"
                ),
                "-an",
                "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
                out,
            ]
            ok2, err2 = run_ff(transform, f"stab-transform-{idx}")
            if ok2 and os.path.exists(out) and probe_duration(out) > 0.1:
                return out
            log.warning("vidstab transform failed: %s", (err2 or "")[:500])
        else:
            log.warning("vidstab detect failed: %s", (err1 or "")[:500])

    # Fallback: deshake
    if has_filter("deshake"):
        cmd = [
            FFMPEG, "-y", "-i", src,
            "-vf", "deshake=rx=64:ry=64:edge=mirror",
            "-an",
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
            out,
        ]
        ok, err = run_ff(cmd, f"deshake-{idx}")
        if ok and os.path.exists(out) and probe_duration(out) > 0.1:
            return out
        log.warning("deshake failed: %s", (err or "")[:500])

    log.warning("Stabilize unavailable/failed for clip %s — using original", idx)
    return src


# ── PER-CLIP ─────────────────────────────────────────────────────────────────
def process_clip(
    src: str,
    speed: float,
    stabilize: bool,
    idx: int,
    keep_audio: bool = False,
    out_w: int = 1920,
    out_h: int = 1080,
) -> Optional[str]:
    work = src
    if stabilize:
        work = stabilize_file(src, idx)

    out = tmp_path(f"clip{idx:03d}", ".mp4")
    vf = (
        f"scale={out_w}:{out_h}:force_original_aspect_ratio=decrease,"
        f"pad={out_w}:{out_h}:(ow-iw)/2:(oh-ih)/2:black,setsar=1,fps=30"
    )
    if abs(speed - 1.0) > 0.01:
        vf += f",setpts=PTS/{speed}"

    cmd = [FFMPEG, "-y", *inputs, "-filter_complex", fc, "-map", f"[{vlabel}]"]
    if keep_audio:
        cmd += ["-map", "0:a?", "-c:a", "aac", "-b:a", "192k"]
    else:
        cmd += ["-an"]
    cmd += ["-c:v", "libx264", "-preset", "medium", "-crf", "20", out]

    ok, err = run_ff(cmd, f"process-clip-{idx}")
    if not ok or not os.path.exists(out):
        log.error("process_clip %s failed: %s", idx, (err or "")[:800])
        return None

    dur = probe_duration(out)
    if dur < 0.05:
        log.error("process_clip %s zero duration", idx)
        return None
    return out


# ── CONCAT + XFADE (duration-accurate) ───────────────────────────────────────
def concat_with_fade(paths: list[str], fade_sec: float = TRANSITION_SEC, keep_audio: bool = False) -> Optional[str]:
    """সব প্রসেসড ক্লিপ xfade দিয়ে জোড়া। keep_audio=True হলে অডিওও রাখে।"""
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
        if keep_audio:
            # ভিডিও + অডিও দুটোই fade
            fc = (
                f"[0:v][1:v]xfade=transition=fade:duration={fade_sec}:offset={offset:.3f}[v];"
                f"[0:a][1:a]acrossfade=d={fade_sec}[a]"
            )
            cmd = [
                FFMPEG, "-y",
                "-i", current,
                "-i", paths[i],
                "-filter_complex", fc,
                "-map", "[v]", "-map", "[a]",
                "-c:v", "libx264", "-preset", "medium", "-crf", "20",
                "-c:a", "aac", "-b:a", "192k",
                out,
            ]
        else:
            cmd = [
                FFMPEG, "-y",
                "-i", current,
                "-i", paths[i],
                "-filter_complex",
                f"[0:v][1:v]xfade=transition=fade:duration={fade_sec}:offset={offset:.3f}[v]",
                "-map", "[v]",
                "-an",
                "-c:v", "libx264", "-preset", "medium", "-crf", "20",
                out,
            ]
        ok, err = run_ff(cmd, f"xfade-{i}")
        if not ok:
            return concat_hard(paths)
        current = out
        new_dur = probe_duration(current)
        offset = max(0.0, new_dur - fade_sec)

    return current


def concat_hard(paths: list[str]) -> Optional[str]:
    lst = tmp_path("list", ".txt")
    with open(lst, "w", encoding="utf-8") as f:
        for p in paths:
            # concat demuxer needs escaped single quotes in path
            safe = ff_path(p).replace("'", "'\\''")
            f.write(f"file '{safe}'\n")
    out = tmp_path("hardjoin", ".mp4")
    # re-encode to avoid codec mismatch
    cmd = [
        FFMPEG, "-y", "-f", "concat", "-safe", "0", "-i", lst,
        "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-an",
        out,
    ]
    ok, _ = run_ff(cmd, "hard-concat")
    return out if ok and os.path.exists(out) else None


# ── LOGO + TEXT ──────────────────────────────────────────────────────────────
def burn_logo_and_text(
    video: str,
    logo_path: Optional[str],
    overlay_text: str,
    font_size: int = 36,
    keep_audio: bool = False,
) -> Optional[str]:
    out = tmp_path("branded", ".mp4")
    inputs = ["-i", video]
    fc_parts = []
    vlabel = "0:v"

    if logo_path and os.path.exists(logo_path):
        inputs += ["-i", logo_path]
        fc_parts.append(f"[1:v]scale=140:-1[lg];[{vlabel}][lg]overlay=W-w-24:24[v1]")
        vlabel = "v1"

    if overlay_text.strip() and os.path.exists(FONT_PATH):
        t = escape_drawtext(overlay_text.strip())
        fp = escape_font(FONT_PATH)
        fc_parts.append(
            f"[{vlabel}]drawtext=fontfile='{fp}':text='{t}':"
            f"fontsize={font_size}:fontcolor=white:borderw=2:bordercolor=black:"
            f"x=(w-text_w)/2:y=h-th-40[v2]"
        )
        vlabel = "v2"
    elif overlay_text.strip():
        log.warning("Font missing at %s — skip drawtext", FONT_PATH)

    if not fc_parts:
        shutil.copy2(video, out)
        return out

    fc = ";".join(fc_parts)
    cmd = [
        FFMPEG, "-y", *inputs,
        "-filter_complex", fc,
        "-map", f"[{vlabel}]",
        "-an",
        "-c:v", "libx264", "-preset", "medium", "-crf", "20",
        out,
    ]
    ok, _ = run_ff(cmd, "logo-text")
    return out if ok and os.path.exists(out) else video


# ── AUDIO ────────────────────────────────────────────────────────────────────
def mix_audio(
    video: str,
    vo_path: Optional[str],
    bgm_path: Optional[str],
    bgm_volume: float = 0.12,
) -> Optional[str]:
    out = tmp_path("final_audio", ".mp4")
    vdur = probe_duration(video)
    if vdur <= 0:
        return video

    if not vo_path and not bgm_path:
        cmd = [
            FFMPEG, "-y", "-i", video,
            "-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=44100",
            "-shortest", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", out,
        ]
        ok, _ = run_ff(cmd, "silent-audio")
        return out if ok else video

    if vo_path and not bgm_path:
        cmd = [
            FFMPEG, "-y", "-i", video, "-i", vo_path,
            "-filter_complex", "[1:a]highpass=f=80,volume=1.25,aformat=sample_rates=44100:channel_layouts=stereo[a]",
            "-map", "0:v", "-map", "[a]",
            "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
            "-t", f"{vdur:.3f}",
            out,
        ]
        ok, _ = run_ff(cmd, "mix-vo")
        return out if ok else video

    if vo_path and bgm_path:
        cmd = [
            FFMPEG, "-y", "-i", video, "-i", vo_path, "-i", bgm_path,
            "-filter_complex",
            f"[1:a]highpass=f=80,volume=1.25,aformat=sample_rates=44100:channel_layouts=stereo[vo];"
            f"[2:a]volume={bgm_volume},aformat=sample_rates=44100:channel_layouts=stereo[bg];"
            f"[vo][bg]amix=inputs=2:duration=first:dropout_transition=2[a]",
            "-map", "0:v", "-map", "[a]",
            "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
            "-t", f"{vdur:.3f}",
            out,
        ]
        ok, _ = run_ff(cmd, "mix-vo-bgm")
        return out if ok else video

    # only BGM
    cmd = [
        FFMPEG, "-y", "-i", video, "-i", bgm_path,
        "-filter_complex", f"[1:a]volume={bgm_volume}[a]",
        "-map", "0:v", "-map", "[a]",
        "-c:v", "copy", "-c:a", "aac",
        "-t", f"{vdur:.3f}",
        out,
    ]
    ok, _ = run_ff(cmd, "mix-bgm")
    return out if ok else video


def export_9x16(video_16x9: str) -> Optional[str]:
    day_dir = os.path.join(OUTPUT_DIR, datetime.now().strftime("%Y-%m-%d"))
    Path(day_dir).mkdir(parents=True, exist_ok=True)
    out = os.path.join(day_dir, f"reels_{datetime.now().strftime('%H%M%S')}.mp4")
    vf = f"scale=-1:{REELS_H},crop={REELS_W}:{REELS_H}:(in_w-{REELS_W})/2:0,setsar=1"
    cmd = [
        FFMPEG, "-y", "-i", video_16x9,
        "-vf", vf,
        "-c:v", "libx264", "-preset", "medium", "-crf", "20",
        "-c:a", "copy",
        out,
    ]
    ok, _ = run_ff(cmd, "9x16")
    return out if ok else None


# ── PIPELINE ─────────────────────────────────────────────────────────────────
def run_pipeline(
    clip_paths: list[str],
    speed: float,
    stabilize: bool,
    logo_path: Optional[str],
    overlay_text: str,
    vo_path: Optional[str],
    bgm_path: Optional[str],
    bgm_vol: float,
    out_w: int,
    out_h: int,
    keep_audio_flags: list[bool],
    status,
    bar,
):
    ensure_dirs()
    n = len(clip_paths)
    processed = []

    # Expected total after speed (rough, before transitions)
    raw_total = sum(probe_duration(p) for p in clip_paths)
    expected = raw_total / max(speed, 0.1)
    status.write(
        f"সোর্স ~{raw_total/60:.1f} মিনিট → স্পিড {speed}x পরে আনুমানিক ~{expected/60:.1f} মিনিট "
        f"(ট্রানজিশন বাদ)"
    )

    for i, src in enumerate(clip_paths):
        status.write(f"ক্লিপ {i+1}/{n}: {os.path.basename(src)}")
        bar.progress(min(0.85, (i) / max(n + 3, 1)))
        keep = keep_audio_flags[i] if i < len(keep_audio_flags) else False
        p = process_clip(src, speed, stabilize, i, keep_audio=keep, out_w=out_w, out_h=out_h)
        if not p:
            st.error(f"ক্লিপ ফেল হয়েছে — থামানো হলো: `{os.path.basename(src)}`")
            return None
        processed.append(p)

    if len(processed) != n:
        st.error(f"ক্লিপ সংখ্যা মিলছে না: চাই {n}, পেয়েছি {len(processed)}")
        return None

    # কোনো ক্লিপে keep_audio আছে কিনা চেক
    any_keep_audio = any(c.get("keep_audio", False) for c in st.session_state.clips)

    status.write("ট্রানজিশন দিয়ে জোড়া লাগানো হচ্ছে…")
    bar.progress((n) / (n + 4))
    joined = concat_with_fade(processed, TRANSITION_SEC, keep_audio=any_keep_audio)
    if not joined:
        st.error("জোড়া লাগানো ব্যর্থ")
        return None

    status.write("লোগো / টেক্সট…")
    bar.progress((n + 1) / (n + 4))
    branded = burn_logo_and_text(joined, logo_path, overlay_text, keep_audio=any_keep_audio) or joined

    status.write("অডিও মিক্স…")
    bar.progress(0.96)
    final = mix_audio(branded, vo_path, bgm_path, bgm_vol) or branded

    day_dir = os.path.join(OUTPUT_DIR, datetime.now().strftime("%Y-%m-%d"))
    Path(day_dir).mkdir(parents=True, exist_ok=True)
    final_out = os.path.join(day_dir, f"farm_{datetime.now().strftime('%H%M%S')}_16x9.mp4")
    shutil.copy2(final, final_out)
    cleanup_temp(keep=final_out)          # ← নতুন লাইন
    bar.progress(1.0)
    status.write("সম্পন্ন।")
    return final_out


# ── UI ───────────────────────────────────────────────────────────────────────
def main():
    st.set_page_config(page_title="Farmer Kamol Video", layout="wide", page_icon="🌾")
    st.markdown(
        """
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&display=swap');
        html, body, [class*="css"] { font-family: 'Hind Siliguri', sans-serif !important; }
        </style>
        """,
        unsafe_allow_html=True,
    )
    ensure_dirs()
    if "clips" not in st.session_state:
        st.session_state.clips = []

    st.title("🌾 Farmer Kamol — ভিডিও টুল")
    st.caption("স্টেবিলাইজ · স্পিড · এক ট্রানজিশন · VO · ১৬:৯ / ৯:১৬")

    if not check_ffmpeg():
        st.error("FFmpeg পাওয়া যায়নি। `ffmpeg/bin/ffmpeg.exe` রাখুন।")
        return

    with st.sidebar:
        st.write("**FFmpeg filters**")
        st.write(f"vidstab: `{'✅' if has_filter('vidstabdetect') else '❌'}`")
        st.write(f"deshake: `{'✅' if has_filter('deshake') else '❌'}`")

    menu = st.sidebar.radio(
        "মেনু",
        ["১. ফুটেজ", "২. সেটিংস", "৩. অডিও ও লোগো", "৪. রেন্ডার", "৫. ৯:১৬ রিলস"],
    )

    if menu.startswith("১"):
        st.header("ফুটেজ ইনপুট")
        ups = st.file_uploader(
            "ভিডিও ক্লিপ (একাধিক)",
            type=["mp4", "mov", "mkv", "avi", "m4v"],
            accept_multiple_files=True,
        )
        if ups and st.button("ক্লিপ যোগ + সময় অনুযায়ী সর্ট", type="primary"):
            batch = os.path.join(TEMP_DIR, "uploads")
            Path(batch).mkdir(parents=True, exist_ok=True)
            for u in ups:
                p = save_upload(u, batch)
                ts = probe_creation_time(p)
                st.session_state.clips.append(
                    {"path": p, "name": u.name, "ts": ts, "keep_audio": False}
                )
            st.session_state.clips.sort(key=lambda c: c["ts"])
            st.success(f"{len(ups)} টি যোগ + সর্ট")
            st.rerun()

        if st.session_state.clips:
            st.subheader(f"ক্লিপ ({len(st.session_state.clips)})")
            total_raw = 0.0
            for i, c in enumerate(st.session_state.clips):
                d = probe_duration(c["path"])
                total_raw += d
                cols = st.columns([0.06, 0.34, 0.18, 0.12, 0.1, 0.1, 0.1])
                cols[0].write(f"**{i+1}**")
                cols[1].write(c["name"])
                try:
                    cols[2].write(datetime.fromtimestamp(c["ts"]).strftime("%m-%d %H:%M"))
                except Exception:
                    cols[2].write("—")
                cols[3].write(f"{d:.1f}s")
                keep = cols[4].checkbox("🔊", value=c.get("keep_audio", False), key=f"aud{i}")
                st.session_state.clips[i]["keep_audio"] = keep
                if cols[5].button("↑", key=f"up{i}") and i > 0:
                    st.session_state.clips[i], st.session_state.clips[i - 1] = (
                        st.session_state.clips[i - 1],
                        st.session_state.clips[i],
                    )
                    st.rerun()
                if cols[6].button("↓", key=f"dn{i}") and i < len(st.session_state.clips) - 1:
                    st.session_state.clips[i], st.session_state.clips[i + 1] = (
                        st.session_state.clips[i + 1],
                        st.session_state.clips[i],
                    )
                    st.rerun()

            sp = float(st.session_state.get("speed", DEFAULT_SPEED))
            st.info(
                f"মোট raw ~ **{total_raw/60:.1f} মিনিট** → {sp}x পরে ~ **{total_raw/sp/60:.1f} মিনিট**"
            )
            c1, c2 = st.columns(2)
            if c1.button("আবার সময়-সর্ট"):
                st.session_state.clips.sort(key=lambda c: c["ts"])
                st.rerun()
            if c2.button("সব মুছুন"):
                st.session_state.clips = []
                st.rerun()
        else:
            st.info("ক্লিপ আপলোড করুন।")

    elif menu.startswith("২"):
        st.header("সেটিংস")
        keys = list(RESOLUTIONS.keys())
        cur = st.session_state.get("resolution", keys[0])
        st.session_state["resolution"] = st.selectbox(
            "আউটপুট রেজোলিউশন (১৬:৯)",
            keys,
            index=keys.index(cur) if cur in keys else 0,
        )
        st.session_state["speed"] = st.slider(
            "স্পিড (সব ক্লিপে একই)",
            1.0, float(MAX_SPEED),
            float(st.session_state.get("speed", DEFAULT_SPEED)),
            0.1,
        )
        st.session_state["stabilize"] = st.checkbox(
            "স্টেবিলাইজ (শক্ত — সময় বেশি লাগে)",
            value=st.session_state.get("stabilize", True),
        )
        st.session_state["overlay_text"] = st.text_area(
            "অন-স্ক্রিন টেক্সট (হিসাব/নোট)",
            value=st.session_state.get("overlay_text", ""),
            height=100,
        )
        if not os.path.exists(FONT_PATH):
            st.warning(f"ফন্ট নেই: `{FONT_PATH}`")

    elif menu.startswith("৩"):
        st.header("অডিও ও লোগো")
        logo_up = st.file_uploader("লোগো PNG", type=["png", "jpg", "webp"])
        if logo_up:
            st.session_state["logo_path"] = save_upload(logo_up, TEMP_DIR)
            st.image(st.session_state["logo_path"], width=120)
        vo_up = st.file_uploader("ভয়েসওভার", type=["mp3", "wav", "m4a", "aac"])
        if vo_up:
            st.session_state["vo_path"] = save_upload(vo_up, TEMP_DIR)
            st.success(vo_up.name)
        st.session_state["use_bgm"] = st.checkbox(
            "BGM (ঐচ্ছিক)", value=st.session_state.get("use_bgm", False)
        )
        if st.session_state.get("use_bgm"):
            bgm_up = st.file_uploader("BGM", type=["mp3", "wav", "m4a"])
            if bgm_up:
                st.session_state["bgm_path"] = save_upload(bgm_up, TEMP_DIR)
            st.session_state["bgm_vol"] = st.slider("BGM ভলিউম", 0.05, 0.4, 0.12, 0.01)

    elif menu.startswith("৪"):
        st.header("রেন্ডার · ১৬:৯")
        n = len(st.session_state.clips)
        st.write(
            f"ক্লিপ **{n}** | রেজো **{st.session_state.get('resolution', '1080p')}** | "
            f"স্পিড **{st.session_state.get('speed', DEFAULT_SPEED)}x** | "
            f"স্টেবিলাইজ **{st.session_state.get('stabilize', True)}**"
        )
        if n == 0:
            st.warning("আগে ফুটেজ যোগ করুন।")
        elif st.button("রেন্ডার শুরু", type="primary"):
            status = st.empty()
            bar = st.progress(0)
            paths = [c["path"] for c in st.session_state.clips]
            flags = [bool(c.get("keep_audio", False)) for c in st.session_state.clips]
            res_label = st.session_state.get("resolution", "1080p (1920×1080)")
            out_w, out_h = RESOLUTIONS.get(res_label, (1920, 1080))
            result = run_pipeline(
                clip_paths=paths,
                speed=float(st.session_state.get("speed", DEFAULT_SPEED)),
                stabilize=bool(st.session_state.get("stabilize", True)),
                logo_path=st.session_state.get("logo_path"),
                overlay_text=st.session_state.get("overlay_text", ""),
                vo_path=st.session_state.get("vo_path"),
                bgm_path=st.session_state.get("bgm_path") if st.session_state.get("use_bgm") else None,
                bgm_vol=float(st.session_state.get("bgm_vol", 0.12)),
                out_w=out_w,
                out_h=out_h,
                keep_audio_flags=flags,
                status=status,
                bar=bar,
            )
            if result:
                st.session_state["last_16x9"] = result
                st.success(result)
                st.video(result)
            else:
                st.error("রেন্ডার ব্যর্থ — সাইডবারে vidstab/deshake স্ট্যাটাস ও টার্মিনাল লগ দেখুন।")

    elif menu.startswith("৫"):
        st.header("৯:১৬ রিলস")
        src = st.session_state.get("last_16x9")
        if not src or not os.path.exists(src):
            up = st.file_uploader("১৬:৯ MP4", type=["mp4"])
            if up:
                src = save_upload(up, TEMP_DIR)
        if src and os.path.exists(src):
            st.video(src)
            if st.button("৯:১৬ এক্সপোর্ট", type="primary"):
                out = export_9x16(src)
                if out:
                    st.success(out)
                    st.video(out)
                else:
                    st.error("ব্যর্থ")
        else:
            st.info("আগে ১৬:৯ রেন্ডার করুন।")


if __name__ == "__main__":
    main()