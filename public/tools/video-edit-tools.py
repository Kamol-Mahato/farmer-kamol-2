"""
Farmer Kamol — Farm Video Tool (Simplified)
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

# ── DEFAULTS ─────────────────────────────────────────────────────────────────
DEFAULT_SPEED = 1.8
MAX_SPEED = 6.0
TRANSITION_SEC = 0.6          # একটাই স্মুথ fade
OUT_W, OUT_H = 1920, 1080     # 16:9 ডিফল্ট (runtime এ বদলাবে)
REELS_W, REELS_H = 1080, 1920 # 9:16

RESOLUTIONS = {
    "1080p (1920×1080)": (1920, 1080),
    "1440p / 2K (2560×1440)": (2560, 1440),
    "4K (3840×2160)": (3840, 2160),
}

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("FarmVideo")


# ── UTILS ────────────────────────────────────────────────────────────────────
def ensure_dirs():
    for d in (OUTPUT_DIR, TEMP_DIR):
        Path(d).mkdir(parents=True, exist_ok=True)


def run_ff(cmd: list, desc: str = "") -> tuple[bool, str]:
    log.info("[%s] %s", desc, " ".join(cmd[:12]) + ("..." if len(cmd) > 12 else ""))
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=7200)
        if r.returncode != 0:
            log.error("%s\n%s", desc, (r.stderr or "")[-2500:])
            return False, r.stderr or "ffmpeg error"
        return True, r.stderr or ""
    except subprocess.TimeoutExpired:
        return False, "Timeout"
    except FileNotFoundError:
        return False, "ffmpeg/ffprobe not found"
    except Exception as e:
        return False, str(e)


def probe_duration(path: str) -> float:
    cmd = [FFPROBE, "-v", "error", "-show_entries", "format=duration",
           "-of", "default=noprint_wrappers=1:nokey=1", path]
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if r.returncode == 0 and r.stdout.strip():
            return float(r.stdout.strip())
    except Exception:
        pass
    return 0.0


def probe_creation_time(path: str) -> float:
    """Metadata creation_time → unix ts; না থাকলে file mtime। সকাল→সন্ধ্যা সর্টের জন্য।"""
    cmd = [FFPROBE, "-v", "quiet", "-select_streams", "v:0",
           "-show_entries", "format_tags=creation_time:stream_tags=creation_time",
           "-of", "default=noprint_wrappers=1:nokey=1", path]
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        for line in (r.stdout or "").strip().splitlines():
            line = line.strip()
            if not line:
                continue
            for fmt in ("%Y-%m-%dT%H:%M:%S.%fZ", "%Y-%m-%dT%H:%M:%SZ",
                        "%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S%z"):
                try:
                    return datetime.strptime(line.replace("+00:00", "Z"), fmt.replace("%z", "")).timestamp()
                except Exception:
                    continue
            try:
                return datetime.fromisoformat(line.replace("Z", "+00:00")).timestamp()
            except Exception:
                pass
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
    return os.path.join(TEMP_DIR, f"{prefix}_{int(time.time() * 1000)}{ext}")


def escape_drawtext(text: str) -> str:
    return (text.replace("\\", "\\\\").replace(":", "\\:").replace("'", "\\'")
            .replace("%", "%%").replace("\n", "\\n"))


def escape_font(path: str) -> str:
    return path.replace("\\", "/").replace(":", "\\:")


def check_ffmpeg() -> bool:
    ok, _ = run_ff([FFMPEG, "-version"], "version")
    return ok


# ── PER-CLIP: scale + speed + optional stabilize ─────────────────────────────
def process_clip(
    src: str,
    speed: float,
    stabilize: bool,
    idx: int,
    keep_audio: bool = False,
    out_w: int = 1920,
    out_h: int = 1080,
    progress_cb=None,
) -> Optional[str]:
    """এক ক্লিপ → out_w×out_h, স্পিড, অপশনাল vidstab। keep_audio=True হলে অডিও রাখে।"""
    out = tmp_path(f"clip{idx:03d}", ".mp4")
    filters = []

    # Strong stabilize (vidstab) — দুই পাস
    if stabilize:
        trf = tmp_path(f"stab{idx:03d}", ".trf")
        detect_cmd = [
            FFMPEG, "-y", "-i", src,
            "-vf", f"vidstabdetect=shakiness=10:accuracy=15:result={trf.replace(chr(92), '/')}",
            "-f", "null", "-"
        ]
        ok, err = run_ff(detect_cmd, f"stab-detect-{idx}")
        if ok and os.path.exists(trf):
            filters.append(
                f"vidstabtransform=input={trf.replace(chr(92), '/')}:smoothing=30:crop=black:zoom=0:optzoom=1"
            )
        else:
            log.warning("vidstab detect failed clip %s — skip stabilize", idx)

    # Scale/pad to selected 16:9 resolution
    filters.append(
        f"scale={out_w}:{out_h}:force_original_aspect_ratio=decrease,"
        f"pad={out_w}:{out_h}:(ow-iw)/2:(oh-ih)/2:black,setsar=1"
    )

    # Speed (video)
    if abs(speed - 1.0) > 0.01:
        filters.append(f"setpts=PTS/{speed}")

    vf = ",".join(filters)

    cmd = [
        FFMPEG, "-y", "-i", src,
        "-vf", vf,
    ]
    if keep_audio:
        # স্পিডের সাথে অডিও মিলিয়ে (atempo 0.5–100 রেঞ্জে চেইন)
        atempo_filters = []
        sp = float(speed)
        while sp > 2.0:
            atempo_filters.append("atempo=2.0")
            sp /= 2.0
        while sp < 0.5:
            atempo_filters.append("atempo=0.5")
            sp /= 0.5
        atempo_filters.append(f"atempo={sp:.4f}")
        af = ",".join(atempo_filters)
        cmd += ["-af", af, "-c:a", "aac", "-b:a", "192k"]
    else:
        cmd += ["-an"]
    cmd += [
        "-c:v", "libx264", "-preset", "medium", "-crf", "20",
        "-movflags", "+faststart",
        out,
    ]
    ok, err = run_ff(cmd, f"process-clip-{idx}")
    if progress_cb:
        progress_cb()
    return out if ok and os.path.exists(out) else None


# ── CONCAT with single xfade transition ──────────────────────────────────────
def concat_with_fade(paths: list[str], fade_sec: float = TRANSITION_SEC) -> Optional[str]:
    """সব প্রসেসড ক্লিপ xfade দিয়ে জোড়া।"""
    if not paths:
        return None
    if len(paths) == 1:
        out = tmp_path("joined", ".mp4")
        shutil.copy2(paths[0], out)
        return out

    # durations after speed already applied
    durs = [probe_duration(p) for p in paths]
    if any(d <= 0 for d in durs):
        # fallback concat demuxer (hard cut)
        return concat_hard(paths)

    current = paths[0]
    offset = max(0.0, durs[0] - fade_sec)

    for i in range(1, len(paths)):
        out = tmp_path(f"xfade{i}", ".mp4")
        # xfade needs both inputs; offset = when second starts relative to first timeline
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
        # next offset: previous output duration - fade
        new_dur = probe_duration(current)
        offset = max(0.0, new_dur - fade_sec)

    return current


def concat_hard(paths: list[str]) -> Optional[str]:
    lst = tmp_path("list", ".txt")
    with open(lst, "w", encoding="utf-8") as f:
        for p in paths:
            f.write(f"file '{p.replace(chr(92), '/')}'\n")
    out = tmp_path("hardjoin", ".mp4")
    cmd = [FFMPEG, "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", out]
    ok, _ = run_ff(cmd, "hard-concat")
    return out if ok else None


# ── LOGO + ON-SCREEN TEXT ────────────────────────────────────────────────────
def burn_logo_and_text(
    video: str,
    logo_path: Optional[str],
    overlay_text: str,
    font_size: int = 36,
) -> Optional[str]:
    out = tmp_path("branded", ".mp4")
    inputs = ["-i", video]
    fc_parts = []
    vlabel = "0:v"

    if logo_path and os.path.exists(logo_path):
        inputs += ["-i", logo_path]
        # logo top-right-ish standard, ~120px wide, margin
        fc_parts.append(
            f"[1:v]scale=140:-1[lg];[{vlabel}][lg]overlay=W-w-24:24[v1]"
        )
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
        log.warning("Font missing — skip drawtext. Put HindSiliguri-Regular.ttf in fonts/")

    if not fc_parts:
        shutil.copy2(video, out)
        return out

    fc = ";".join(fc_parts)
    cmd = [FFMPEG, "-y", *inputs, "-filter_complex", fc, "-map", f"[{vlabel}]",
           "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "20", out]
    ok, _ = run_ff(cmd, "logo-text")
    return out if ok else None


# ── VOICEOVER (+ optional BGM) ───────────────────────────────────────────────
def mix_audio(
    video: str,
    vo_path: Optional[str],
    bgm_path: Optional[str],
    bgm_volume: float = 0.12,
) -> Optional[str]:
    out = tmp_path("final_audio", ".mp4")
    vdur = probe_duration(video)
    if vdur <= 0:
        return None

    if not vo_path and not bgm_path:
        # silent audio track so players are happy
        cmd = [
            FFMPEG, "-y", "-i", video,
            "-f", "lavfi", "-i", f"anullsrc=channel_layout=stereo:sample_rate=44100",
            "-shortest", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", out,
        ]
        ok, _ = run_ff(cmd, "silent-audio")
        return out if ok else video

    inputs = ["-i", video]
    filters = []
    maps = ["-map", "0:v"]

    if vo_path:
        inputs += ["-i", vo_path]
        # loudnorm-ish: volume boost + mild highpass
        filters.append("[1:a]highpass=f=80,volume=1.3,aformat=sample_rates=44100:channel_layouts=stereo[vo]")
        a_out = "[vo]"
        if bgm_path:
            inputs += ["-i", bgm_path]
            filters.append(
                f"[2:a]volume={bgm_volume},aformat=sample_rates=44100:channel_layouts=stereo[bg];"
                f"[vo][bg]amix=inputs=2:duration=first:dropout_transition=2[a]"
            )
            a_out = "[a]"
        filters_str = ";".join(filters) if filters else None
        cmd = [FFMPEG, "-y", *inputs]
        if filters_str:
            cmd += ["-filter_complex", filters_str, "-map", "0:v", "-map", a_out]
        else:
            cmd += ["-map", "0:v", "-map", "1:a"]
        cmd += ["-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", out]
        ok, _ = run_ff(cmd, "mix-vo")
        return out if ok else None

    # only BGM
    inputs += ["-i", bgm_path]
    cmd = [
        FFMPEG, "-y", *inputs,
        "-filter_complex", f"[1:a]volume={bgm_volume}[a]",
        "-map", "0:v", "-map", "[a]",
        "-c:v", "copy", "-c:a", "aac", "-shortest", out,
    ]
    ok, _ = run_ff(cmd, "mix-bgm")
    return out if ok else None


# ── 9:16 CROP ────────────────────────────────────────────────────────────────
def export_9x16(video_16x9: str) -> Optional[str]:
    day_dir = os.path.join(OUTPUT_DIR, datetime.now().strftime("%Y-%m-%d"))
    Path(day_dir).mkdir(parents=True, exist_ok=True)
    out = os.path.join(day_dir, f"reels_{datetime.now().strftime('%H%M%S')}.mp4")
    # center crop 1080x1920 from 1920x1080 is impossible without letterbox;
    # scale height to 1920 then crop width to 1080 center
    vf = (
        f"scale=-1:{REELS_H},"
        f"crop={REELS_W}:{REELS_H}:(in_w-{REELS_W})/2:0,setsar=1"
    )
    cmd = [
        FFMPEG, "-y", "-i", video_16x9,
        "-vf", vf,
        "-c:v", "libx264", "-preset", "medium", "-crf", "20",
        "-c:a", "copy",
        out,
    ]
    ok, _ = run_ff(cmd, "9x16")
    return out if ok else None


# ── FULL PIPELINE ────────────────────────────────────────────────────────────
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
    status,
    bar,
):
    ensure_dirs()
    n = len(clip_paths)
    processed = []

    for i, src in enumerate(clip_paths):
        status.write(f"ক্লিপ প্রসেস হচ্ছে {i+1}/{n} …")
        bar.progress((i) / (n + 4))
        keep_audio = bool(st.session_state.clips[i].get("keep_audio", False)) if i < len(st.session_state.clips) else False
        p = process_clip(src, speed, stabilize, i, keep_audio=keep_audio, out_w=out_w, out_h=out_h)
        if not p:
            st.error(f"ক্লিপ ফেল: {os.path.basename(src)}")
            return None
        processed.append(p)

    status.write("ট্রানজিশন দিয়ে জোড়া লাগানো হচ্ছে…")
    bar.progress((n) / (n + 4))
    joined = concat_with_fade(processed, TRANSITION_SEC)
    if not joined:
        st.error("জোড়া লাগানো ব্যর্থ")
        return None

    status.write("লোগো / টেক্সট…")
    bar.progress((n + 1) / (n + 4))
    branded = burn_logo_and_text(joined, logo_path, overlay_text) or joined

    status.write("অডিও মিক্স…")
    bar.progress((n + 2) / (n + 4))
    final = mix_audio(branded, vo_path, bgm_path, bgm_vol) or branded

    # copy to Output / YYYY-MM-DD /
    day_dir = os.path.join(OUTPUT_DIR, datetime.now().strftime("%Y-%m-%d"))
    Path(day_dir).mkdir(parents=True, exist_ok=True)
    final_out = os.path.join(day_dir, f"farm_{datetime.now().strftime('%H%M%S')}_16x9.mp4")
    shutil.copy2(final, final_out)
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
        st.session_state.clips = []  # list of {path, name, ts}

    st.title("🌾 Farmer Kamol — ভিডিও টুল")
    st.caption("অফলাইন · ১৬:৯ ডিফল্ট · স্পিড ১.৮x · স্টেবিলাইজ · এক ট্রানজিশন · ভয়েসওভার")

    if not check_ffmpeg():
        st.error("FFmpeg পাওয়া যায়নি। `ffmpeg/bin/ffmpeg.exe` রাখুন বা PATH-এ ffmpeg দিন।")
        return

    menu = st.sidebar.radio(
        "মেনু",
        ["১. ফুটেজ", "২. সেটিংস", "৩. অডিও ও লোগো", "৪. রেন্ডার", "৫. ৯:১৬ রিলস"],
    )

    # ── 1. FOOTAGE ──
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
                st.session_state.clips.append({"path": p, "name": u.name, "ts": ts})
            st.session_state.clips.sort(key=lambda c: c["ts"])
            st.success(f"{len(ups)} টি ক্লিপ যোগ + সকাল→সন্ধ্যা সর্ট হয়েছে")
            st.rerun()

        if st.session_state.clips:
            st.subheader(f"ক্লিপ তালিকা ({len(st.session_state.clips)})")
            for i, c in enumerate(st.session_state.clips):
                cols = st.columns([0.06, 0.38, 0.22, 0.12, 0.1, 0.1])
                cols[0].write(f"**{i+1}**")
                cols[1].write(c["name"])
                try:
                    cols[2].write(datetime.fromtimestamp(c["ts"]).strftime("%Y-%m-%d %H:%M"))
                except Exception:
                    cols[2].write("—")
                # ডিফল্ট মিউট; চাইলে unmute
                keep = cols[3].checkbox("🔊", value=c.get("keep_audio", False), key=f"aud{i}", help="Unmute এই ক্লিপ")
                st.session_state.clips[i]["keep_audio"] = keep
                if cols[4].button("↑", key=f"up{i}") and i > 0:
                    st.session_state.clips[i], st.session_state.clips[i - 1] = (
                        st.session_state.clips[i - 1],
                        st.session_state.clips[i],
                    )
                    st.rerun()
                if cols[5].button("↓", key=f"dn{i}") and i < len(st.session_state.clips) - 1:
                    st.session_state.clips[i], st.session_state.clips[i + 1] = (
                        st.session_state.clips[i + 1],
                        st.session_state.clips[i],
                    )
                    st.rerun()

            c1, c2 = st.columns(2)
            if c1.button("আবার সময় অনুযায়ী সর্ট"):
                st.session_state.clips.sort(key=lambda c: c["ts"])
                st.rerun()
            if c2.button("সব ক্লিপ মুছুন"):
                st.session_state.clips = []
                st.rerun()
        else:
            st.info("ক্লিপ আপলোড করে সর্ট বাটনে চাপুন।")

    # ── 2. SETTINGS ──
    elif menu.startswith("২"):
        st.header("সেটিংস")
        st.session_state["resolution"] = st.selectbox(
            "আউটপুট রেজোলিউশন (১৬:৯)",
            list(RESOLUTIONS.keys()),
            index=list(RESOLUTIONS.keys()).index(st.session_state["resolution"])
            if st.session_state.get("resolution") in RESOLUTIONS
            else 0,
        )
        st.caption("সোর্স যত বড়, তত বেশি ডিটেইল। 1080p ফুটেজ 4K করলে শুধু আপস্কেল।")
        st.session_state["speed"] = st.slider(
            "স্পিড (সব ক্লিপে একই)", 1.0, float(MAX_SPEED), float(st.session_state.get("speed", DEFAULT_SPEED)), 0.1
        )
        st.session_state["stabilize"] = st.checkbox(
            "স্টেবিলাইজ (শক্তিশালী — সময় বেশি লাগতে পারে)",
            value=st.session_state.get("stabilize", True),
        )
        st.session_state["overlay_text"] = st.text_area(
            "অন-স্ক্রিন টেক্সট (হিসাব / নোট — খালি রাখলে কিছু হবে না)",
            value=st.session_state.get("overlay_text", ""),
            height=100,
        )
        st.caption(f"ট্রানজিশন: fade {TRANSITION_SEC}s (ফিক্সড একটাই)")
        if not os.path.exists(FONT_PATH):
            st.warning(f"ফন্ট নেই: `{FONT_PATH}` — Hind Siliguri নামিয়ে `fonts/` এ রাখুন।")

    # ── 3. AUDIO + LOGO ──
    elif menu.startswith("৩"):
        st.header("অডিও ও লোগো")
        logo_up = st.file_uploader("লোগো PNG (Farmer Kamol)", type=["png", "jpg", "webp"])
        if logo_up:
            st.session_state["logo_path"] = save_upload(logo_up, TEMP_DIR)
            st.image(st.session_state["logo_path"], width=120)

        vo_up = st.file_uploader("ভয়েসওভার (একটা ট্র্যাক)", type=["mp3", "wav", "m4a", "aac"])
        if vo_up:
            st.session_state["vo_path"] = save_upload(vo_up, TEMP_DIR)
            st.success(f"VO: {vo_up.name}")

        st.markdown("---")
        st.session_state["use_bgm"] = st.checkbox(
            "ব্যাকগ্রাউন্ড মিউজিক (ঐচ্ছিক — ডিফল্ট অফ)",
            value=st.session_state.get("use_bgm", False),
        )
        if st.session_state.get("use_bgm"):
            bgm_up = st.file_uploader("BGM ফাইল", type=["mp3", "wav", "m4a"])
            if bgm_up:
                st.session_state["bgm_path"] = save_upload(bgm_up, TEMP_DIR)
            st.session_state["bgm_vol"] = st.slider("BGM ভলিউম", 0.05, 0.4, 0.12, 0.01)

    # ── 4. RENDER ──
    elif menu.startswith("৪"):
        st.header("রেন্ডার · ১৬:৯")
        n = len(st.session_state.clips)
        st.write(
            f"ক্লিপ: **{n}** | রেজো: **{st.session_state.get('resolution', '1080p')}** | "
            f"স্পিড: **{st.session_state.get('speed', DEFAULT_SPEED)}x** | "
            f"স্টেবিলাইজ: **{st.session_state.get('stabilize', True)}**"
        )

        if n == 0:
            st.warning("আগে ফুটেজ যোগ করুন।")
        elif st.button("রেন্ডার শুরু", type="primary"):
            status = st.empty()
            bar = st.progress(0)
            paths = [c["path"] for c in st.session_state.clips]
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
                status=status,
                bar=bar,
            )
            if result:
                st.session_state["last_16x9"] = result
                st.success(f"সেভ হয়েছে: `{result}`")
                st.video(result)
            else:
                st.error("রেন্ডার ব্যর্থ — টার্মিনাল লগ দেখুন।")

    # ── 5. REELS ──
    elif menu.startswith("৫"):
        st.header("৯:১৬ রিলস ক্রপ")
        src = st.session_state.get("last_16x9")
        if not src or not os.path.exists(src):
            up = st.file_uploader("অথবা ১৬:৯ MP4 দিন", type=["mp4"])
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
                    st.error("৯:১৬ ব্যর্থ")
        else:
            st.info("আগে ১৬:৯ রেন্ডার করুন অথবা ফাইল দিন।")


if __name__ == "__main__":
    main()