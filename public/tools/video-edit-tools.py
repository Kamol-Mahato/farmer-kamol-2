"""
╔══════════════════════════════════════════════════════════════════════════════════╗
║          🌾  SHADHINATA FARM VIDEO AUTOMATION TOOL  v2.0  🌾                   ║
║          Offline · FFmpeg + NVENC · Streamlit UI · Bangla Unicode               ║
╚══════════════════════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RUNNING THE APP — run_app.bat ডাবল-ক্লিক করুন
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ফোল্ডার স্ট্রাকচার:
  FarmVideo\
    app.py
    run_app.bat
    ffmpeg\bin\ffmpeg.exe
    ffmpeg\bin\ffprobe.exe
    fonts\Li Shadhinata2 2.0 Unicode.ttf
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

# ─────────────────────────────────────────────────────────────────────────────
# IMPORTS
# ─────────────────────────────────────────────────────────────────────────────
import os
import sys
import copy
import time
import shutil
import hashlib
import logging
import subprocess
from pathlib import Path
from datetime import datetime
from typing import Optional

import streamlit as st

# ─────────────────────────────────────────────────────────────────────────────
# ███  PORTABLE PATH CONFIGURATION — কোনো PC তে কাজ করবে  ███
# ─────────────────────────────────────────────────────────────────────────────

# app.py যে ফোল্ডারে আছে সেটাই BASE
BASE_DIR: str = os.path.dirname(os.path.abspath(__file__))

# Bangla font paths — fonts\ ফোল্ডারে দুটো ফন্টই রাখুন
# UI থেকে যেকোনো একটা বেছে নেওয়া যাবে (caption ও watermark এ)
BANGLA_FONTS: dict = {
    "Li Shadhinata2":  os.path.join(BASE_DIR, "fonts", "Li Shadhinata2 2.0 Unicode.ttf"),
    "Hind Siliguri":   os.path.join(BASE_DIR, "fonts", "HindSiliguri-Regular.ttf"),
}
# ডিফল্ট ফন্ট (UI তে প্রথমবার এটাই selected থাকবে)
DEFAULT_BANGLA_FONT: str = "Li Shadhinata2"

# Output ও Temp ফোল্ডার auto-create হবে
OUTPUT_DIR: str = os.path.join(BASE_DIR, "Output")
TEMP_DIR:   str = os.path.join(BASE_DIR, "Temp")

# Portable FFmpeg — আগে portable খোঁজে, না পেলে system PATH ব্যবহার করে
_pf = os.path.join(BASE_DIR, "ffmpeg", "bin", "ffmpeg.exe")
_pp = os.path.join(BASE_DIR, "ffmpeg", "bin", "ffprobe.exe")
FFMPEG_BIN:  str = _pf if os.path.exists(_pf) else "ffmpeg"
FFPROBE_BIN: str = _pp if os.path.exists(_pp) else "ffprobe"

# AI ভয়েস ডিনয়েজ (RNNoise) — মডেল ফাইল থাকলেই কাজ করবে, না থাকলে auto স্কিপ
RNNOISE_MODEL_PATH: str = os.path.join(BASE_DIR, "models", "rnnoise", "voice.rnnn")

# ─────────────────────────────────────────────────────────────────────────────
# VIDEO RENDER PROFILES
# ─────────────────────────────────────────────────────────────────────────────
PROFILES = {
    "1080p — 16:9  (1920×1080)": {"w": 1920, "h": 1080, "bitrate": "15M", "crop_mode": "letterbox"},
    "1080p — 9:16  (1080×1920)": {"w": 1080, "h": 1920, "bitrate": "15M", "crop_mode": "center_crop"},
    "2K   — 16:9  (2560×1440)":  {"w": 2560, "h": 1440, "bitrate": "30M", "crop_mode": "letterbox"},
    "2K   — 9:16  (1440×2560)":  {"w": 1440, "h": 2560, "bitrate": "30M", "crop_mode": "center_crop"},
}

TARGET_FPS:      int   = 60
XFADE_DURATION:  float = 0.3   # seconds — ট্রানজিশন দৈর্ঘ্য
JCUT_OFFSET:     float = 0.2   # seconds — L-Cut audio pre-roll
DEFAULT_SPEED:   float = 1.5   # ডিফল্ট speed (1.1 – 2.0 রেঞ্জ)

# ── ট্রানজিশন টাইপ লিস্ট (FFmpeg xfade এ সাপোর্টেড) ────────────────────────
TRANSITION_OPTIONS = {
    "🌅 Fade (ফেড)"                : "fade",
    "💨 Motion Blur Wipe (মোশন ব্লার)": "hblur",
    "🌊 Slide Left (স্লাইড বাম)"  : "slideleft",
    "🔆 Radial Blur (রেডিয়াল)"    : "radial",
    "⬛ Wipe Right (ওয়াইপ ডান)"  : "wiperight",
}

# ── Zoom/Pan (Ken Burns) স্টাইল লিস্ট ──────────────────────────────────────
ZOOM_PAN_OPTIONS = {
    "❌ None (বন্ধ)"                : "none",
    "🔍 Zoom In (ধীরে বড়)"         : "zoom_in",
    "🔎 Zoom Out (ধীরে ছোট)"       : "zoom_out",
    "➡️ Pan Left → Right"          : "pan_lr",
    "⬅️ Pan Right → Left"          : "pan_rl",
    "↗️ Diagonal Ken Burns"        : "diagonal",
}

# ── Intro/Outro ডিফল্ট সময় ──────────────────────────────────────────────────
DEFAULT_INTRO_DURATION: float = 3.0   # সেকেন্ড
DEFAULT_OUTRO_DURATION: float = 4.0   # সেকেন্ড

# ── Color Grading Preset লিস্ট ──────────────────────────────────────────────
COLOR_GRADE_PRESETS = {
    "❌ None (Original)"        : "none",
    "🌾 Warm Farm (উষ্ণ মাঠ)"   : "warm_farm",
    "🌇 Golden Hour (গোধূলি)"   : "golden_hour",
    "🍀 Vivid Green (গাঢ় সবুজ)": "vivid_green",
    "☁️ Soft Cinematic"         : "soft_cinematic",
}

# ─────────────────────────────────────────────────────────────────────────────
# LOGGING
# ─────────────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
log = logging.getLogger("FarmVideoTool")


# ─────────────────────────────────────────────────────────────────────────────
# ░░░  UTILITY FUNCTIONS  ░░░
# ─────────────────────────────────────────────────────────────────────────────

def ensure_dirs() -> None:
    for d in [OUTPUT_DIR, TEMP_DIR]:
        Path(d).mkdir(parents=True, exist_ok=True)


def ffmpeg_escape_font_path(path: str) -> str:
    """Windows font path কে FFmpeg drawtext filter এর জন্য escape করে।"""
    escaped = path.replace("\\", "\\\\")
    escaped = escaped.replace(":", "\\:")
    return escaped


def ffmpeg_escape_text(text: str) -> str:
    """Bangla/যেকোনো text কে FFmpeg drawtext এর জন্য safe করে।"""
    text = text.replace("'", "\\'")
    text = text.replace(":", "\\:")
    text = text.replace("%", "%%")
    return text


def probe_file_mtime(filepath: str) -> float:
    return os.path.getmtime(filepath)


def probe_duration(filepath: str) -> float:
    """FFprobe দিয়ে ভিডিও/অডিওর duration বের করে (seconds)।"""
    cmd = [
        FFPROBE_BIN, "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        filepath,
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            return float(result.stdout.strip())
    except Exception as e:
        log.warning(f"ffprobe duration failed: {e}")
    return 0.0


def probe_has_audio(filepath: str) -> bool:
    """FFprobe দিয়ে চেক করে ফাইলে audio stream আছে কিনা (mute করা ক্লিপে থাকে না)।"""
    cmd = [
        FFPROBE_BIN, "-v", "error",
        "-select_streams", "a",
        "-show_entries", "stream=index",
        "-of", "csv=p=0",
        filepath,
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        return bool(result.stdout.strip())
    except Exception as e:
        log.warning(f"ffprobe audio-check failed: {e}")
        return False

def run_ffmpeg(cmd: list, description: str = "") -> tuple[bool, str]:
    """
    FFmpeg command চালায়।
    NVENC fail হলে automatically libx264 তে fallback করে।
    """
    log.info(f"FFmpeg [{description}]: {' '.join(cmd)}")
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=3600)
        if result.returncode != 0:
            log.error(f"FFmpeg FAILED [{description}]:\n{result.stderr[-2000:]}")
            return False, result.stderr
        return True, result.stderr
    except subprocess.TimeoutExpired:
        return False, "Process timed out."
    except FileNotFoundError:
        return False, "ffmpeg not found. Please check ffmpeg\\bin\\ffmpeg.exe exists."
    except Exception as e:
        return False, str(e)


def nvenc_to_sw_fallback(cmd: list) -> list:
    """NVENC command কে libx264 software fallback এ convert করে।"""
    cmd = [c.replace("h264_nvenc", "libx264") for c in cmd]
    for flag in ["-preset", "p4", "-rc", "vbr", "-cq", "20"]:
        if flag in cmd:
            cmd.remove(flag)
    if "libx264" in cmd:
        idx = cmd.index("libx264") + 1
        cmd[idx:idx] = ["-preset", "medium", "-crf", "22"]
    return cmd


def save_uploaded_file(uploaded_file, dest_dir: str) -> str:
    dest = Path(dest_dir) / uploaded_file.name
    with open(dest, "wb") as f:
        f.write(uploaded_file.getbuffer())
    return str(dest)


def unique_tmp(prefix: str, ext: str) -> str:
    uid = hashlib.md5(f"{prefix}{time.time()}".encode()).hexdigest()[:8]
    return str(Path(TEMP_DIR) / f"{prefix}_{uid}.{ext}")


def check_ffmpeg_available() -> bool:
    try:
        subprocess.run([FFMPEG_BIN, "-version"], capture_output=True, timeout=10)
        return True
    except Exception:
        return False


def check_nvenc_available() -> bool:
    try:
        result = subprocess.run([FFMPEG_BIN, "-encoders"], capture_output=True, text=True, timeout=15)
        return "h264_nvenc" in result.stdout
    except Exception:
        return False


# ─────────────────────────────────────────────────────────────────────────────
# ░░░  SESSION STATE  ░░░
# ─────────────────────────────────────────────────────────────────────────────

def init_session_state() -> None:
    defaults = {
        # প্রতিটা clip এর dict:
        # { path, name, mtime, unmuted, speed, label, label_end_time,
        #   text_x, text_y }
        "clips":          [],
        "undo_stack":     [],
        "redo_stack":     [],
        "preview_path":   None,
        "final_path":     None,
        "render_status":  "",
        "render_error":   "",
        "nvenc_available": None,
        "vidstab_available": None,
        # Global audio settings
        # ০. AI নয়েজ রিমুভাল (RNNoise) — সম্পূর্ণ অফলাইন, বিনামূল্যে
        "vo_rnnoise":        True,    # ডিফল্ট ON — মডেল ফাইল না থাকলে auto স্কিপ হবে
        "vo_eq_enable":      True,
        "vo_noise_gate":     True,
        "vo_loudnorm":       True,
        "vo_loudnorm_twopass": False,  # ডিফল্ট OFF — ধীর কিন্তু নিখুঁত, ব্যবহারকারী চাইলে ON করবে
        "vo_limiter":        True,     # ডিফল্ট ON — audio clip/ফাটা ঠেকানোর জন্য সবসময় ভালো
        "vo_limiter_level":  0.95,     # 0.90–0.99, কতটা "সিলিং" এ limit হবে
        "vo_ducking":        True,
        "vo_lcut":           True,
        "vo_pitch_correct":  True,
        "vo_aac_320":        True,
        # ৮. Echo/Reverb — কবিতা আবৃত্তি স্টাইলের জন্য
        "vo_echo":           False,   # ডিফল্ট OFF
        "vo_echo_delay":     60.0,    # Echo delay ms (30–300)
        "vo_echo_decay":     0.4,     # Echo তীব্রতা (0.1–0.9)
        # ৯. De-esser — এস/এস স্বরের তীক্ষ্ণতা কমায়
        "vo_deesser":        True,    # ডিফল্ট ON — স্টুডিও quality এর জন্য জরুরি
        "vo_deesser_freq":   6500.0,  # যেখানে "স" শব্দ বসে (Hz), 4000–9000 সাধারণ
        "vo_deesser_amount": 0.5,     # তীব্রতা (0.1–1.0)
        # ১০. De-clicker — প্লোসিভ/মাউথ ক্লিক শব্দ মসৃণ করে
        "vo_declicker":      True,    # ডিফল্ট ON
        # ১১. Wind Noise Filter — বাতাসের নিচু কম্পাঙ্কের শব্দ কাটে
        "vo_wind_filter":    True,    # ডিফল্ট ON — মাঠে রেকর্ডিং এ জরুরি
        "vo_wind_cutoff":    120.0,   # Hz — এর নিচের সব কাটবে (100–150 সাধারণ)
        # ১২. Hum Removal — বৈদ্যুতিক যন্ত্রের 50/60Hz গুনগুন শব্দ কাটে
        "vo_hum_removal":    False,   # ডিফল্ট OFF — শুধু generator/motor থাকলে দরকার
        "vo_hum_freq":       50,      # 50Hz (বাংলাদেশ/ভারত standard) বা 60Hz (US)
        # AI Denoise (afftdn) এর backup/extra adaptive denoise — RNNoise না থাকলে/
        # আরও নয়েজি হলে কাজে লাগে। ডিফল্ট OFF — RNNoise ইতিমধ্যে থাকলে সাধারণত দরকার নেই।
        "vo_afftdn":         False,
        "vo_afftdn_amount":  12.0,    # Noise reduction (dB), 5–25 রেঞ্জ
        # ১৩. Stereo Widening — কণ্ঠ/audio কে প্রশস্ত শোনায়
        "vo_stereo_widen":   False,   # ডিফল্ট OFF — subtle effect, ঐচ্ছিক
        "vo_widen_amount":   1.3,     # 1.0 = কোনো পরিবর্তন নেই, 2.0 = সর্বোচ্চ প্রশস্ত
        # ১৪. Harmonic Exciter — কণ্ঠে উষ্ণতা/চকচকে ভাব যোগ করে
        "vo_exciter":        True,    # ডিফল্ট ON — হালকা প্রয়োগে ভালো প্রভাব
        "vo_exciter_amount": 0.15,    # তীব্রতা (0.05–0.4, কম রাখাই ভালো)
        # ১৫. Multiband Compressor — bass/mid/treble আলাদাভাবে নিয়ন্ত্রণ
        "vo_multiband":      True,    # ডিফল্ট ON — studio-level polish দেয়
        # ১৬. Silence Trimmer — দীর্ঘ নীরবতা auto কাটে
        "vo_silence_trim":       False,  # ডিফল্ট OFF — voiceover এ ব্যবহারকারীর ইচ্ছার উপর
        "vo_silence_threshold":  -35.0,  # dB — এর নিচে হলে "নীরব" ধরা হয়
        "vo_silence_min_dur":    1.0,    # সেকেন্ড — এর বেশি নীরবতা হলে ছাঁটা হয়
        # ১৭. Auto Gain Control — দূরে/কাছে গেলেও volume automatic adjust
        "vo_agc":            True,    # ডিফল্ট ON — মাঠে হাঁটাহাঁটি করে কথা বললে দরকারি
        # ১৮. High/Low Pass Combo — মানুষের কণ্ঠের রেঞ্জের বাইরের শব্দ কাটে
        "vo_bandpass":       True,    # ডিফল্ট ON — সবচেয়ে basic কিন্তু powerful
        "vo_bandpass_low":   80.0,    # Hz — এর নিচে কাটবে
        "vo_bandpass_high":  8000.0,  # Hz — এর উপরে কাটবে
        # Transition type
        "transition_type":  "fade",
        # Smooth Transition Enhancements (স্মুথ ট্রানজিশনের জন্য ৪টা প্রো ফিচার)
        "transition_adaptive_duration": True,   # ছোট/বড় ক্লিপ অনুযায়ী duration auto adjust
        "transition_audio_curve":       "tri",  # acrossfade curve: tri/qsin/exp ইত্যাদি
        "transition_auto_level_match":  False,  # কাট পয়েন্টে volume ফারাক auto সমান করা
        "transition_whoosh_enable":     False,  # ঐচ্ছিক whoosh SFX প্রতি কাটে
        "transition_whoosh_path":       None,   # আপলোড করা whoosh SFX ফাইলের path
        "transition_whoosh_volume":     0.4,    # 0.0–1.0
        # Global speed (1.1 – 2.0)
        "global_speed":     DEFAULT_SPEED,
        # Global Stabilization (Deshake) — speed এর মতোই, নতুন ক্লিপে auto apply হবে
        "global_stabilize_enable":    False,
        "global_stabilize_mode":      "light",   # "strong" (ধীর, শক্তিশালী) বা "light" (দ্রুত)
        "global_stabilize_smoothing": 15,
        "global_stabilize_shakiness": 5,
        "global_stabilize_zoom":      0.0,
        # Background Music (voiceover থেকে আলাদা)
        "bg_music_enable":  False,
        "bg_music_volume":  0.12,   # 12% — voiceover এর নিচে থাকবে
        # বাংলা ফন্ট নির্বাচন (caption + watermark উভয়ের জন্য)
        "selected_bangla_font": DEFAULT_BANGLA_FONT,
        # Color Grading
        "color_grade_preset": "none",
        # Intro
        "intro_enable":     False,
        "intro_text1":      "",
        "intro_text2":      "",
        "intro_duration":   DEFAULT_INTRO_DURATION,
        "intro_bg_color":   "black",
        # Outro
        "outro_enable":     False,
        "outro_text1":      "",
        "outro_text2":      "",
        "outro_duration":   DEFAULT_OUTRO_DURATION,
        "outro_bg_color":   "black",
        # Social Media Icons (শুধু Outro তে ব্যবহার হয় — Like/Comment/Share/Subscribe)
        # প্রতিটা key তে ব্যবহারকারীর আপলোড করা PNG এর path থাকবে, না
        # থাকলে None (মানে সেই icon টা দেখানো হবে না)।
        "social_icon_like_path":       None,
        "social_icon_comment_path":    None,
        "social_icon_share_path":      None,
        "social_icon_subscribe_path":  None,
        # Subtitle (.srt) export
        "srt_export_enable": True,
        "srt_last_content":  "",   # সর্বশেষ generate করা .srt এর content
        "srt_last_path":     None, # সর্বশেষ .srt ফাইলের path (ডাউনলোড বাটনের জন্য)
        "chapter_export_enable": True,
        "chapter_last_content":  "",   # সর্বশেষ generate করা chapter list
        "chapter_last_path":     None, # সর্বশেষ chapter .txt ফাইলের path
        # Preset save/load
        "preset_upload_processed": False,
        # Batch Export (একাধিক resolution/aspect ratio একসাথে)
        "batch_export_enable":      False,
        "batch_profiles_selected":  [],
        "batch_final_paths":        [],   # সর্বশেষ batch render এর সব output path
        # Audio Fade In/Out (পুরো ভিডিওর mixed audio এর উপর প্রয়োগ হয়)
        "audio_fade_in_enable":  False,
        "audio_fade_in_sec":     1.5,
        "audio_fade_out_enable": False,
        "audio_fade_out_sec":    2.0,
    }
    for key, value in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = value


# ─────────────────────────────────────────────────────────────────────────────
# ░░░  UNDO / REDO  ░░░
# ─────────────────────────────────────────────────────────────────────────────

def push_undo_snapshot() -> None:
    st.session_state["undo_stack"].append(copy.deepcopy(st.session_state["clips"]))
    st.session_state["redo_stack"] = []

def do_undo() -> None:
    if st.session_state["undo_stack"]:
        st.session_state["redo_stack"].append(copy.deepcopy(st.session_state["clips"]))
        st.session_state["clips"] = st.session_state["undo_stack"].pop()

def do_redo() -> None:
    if st.session_state["redo_stack"]:
        st.session_state["undo_stack"].append(copy.deepcopy(st.session_state["clips"]))
        st.session_state["clips"] = st.session_state["redo_stack"].pop()


# ─────────────────────────────────────────────────────────────────────────────
# ░░░  VIDEO FILTER BUILDERS  ░░░
# ─────────────────────────────────────────────────────────────────────────────

def build_rotate_mirror_filter(rotate_degrees: int, mirror: bool) -> str:
    """
    ভিডিও ঘোরানো (90/180/270 ডিগ্রি) ও আয়নার মতো উল্টানো (Flip/Mirror)
    এর জন্য FFmpeg filter string তৈরি করে।

    Rotate ব্যবহার হয় FFmpeg এর 'transpose' filter দিয়ে:
      90°  → transpose=1 (clockwise)
      180° → transpose=2,transpose=2 (দুইবার 90° clockwise)
      270° → transpose=2 (counter-clockwise, বা 90° বিপরীত দিকে)

    Mirror ব্যবহার হয় 'hflip' (horizontal flip, আয়নার মতো)।

    Args:
        rotate_degrees: 0, 90, 180, বা 270 — কত ডিগ্রি ঘোরানো হবে।
        mirror:         True হলে horizontal flip (আয়না প্রতিফলন) যোগ হবে।

    Returns:
        FFmpeg filter string, বা কোনো পরিবর্তন না লাগলে খালি string।
    """
    parts = []

    if rotate_degrees == 90:
        parts.append("transpose=1")
    elif rotate_degrees == 180:
        parts.append("transpose=2,transpose=2")
    elif rotate_degrees == 270:
        parts.append("transpose=2")
    # rotate_degrees == 0 হলে কিছুই যোগ হবে না

    if mirror:
        parts.append("hflip")

    return ",".join(parts)


def build_scale_filter(w: int, h: int, crop_mode: str) -> str:
    """Scale + crop filter তৈরি করে।
    center_crop: 9:16 portrait এর জন্য — মাঝের অংশ রেখে বাকি কাটে।
    letterbox:   16:9 landscape — কালো bar দিয়ে fit করে।
    """
    if crop_mode == "center_crop":
        return (
            f"scale='if(gt(iw/ih,{w}/{h}),{h}*iw/ih,{w})'"
            f":'if(gt(iw/ih,{w}/{h}),{h},iw*{h}/{w})',"
            f"crop={w}:{h}"
        )
    else:
        return (
            f"scale={w}:{h}:force_original_aspect_ratio=decrease,"
            f"pad={w}:{h}:(ow-iw)/2:(oh-ih)/2:black"
        )


def build_drawtext_filter(
    text: str,
    font_path: str,
    fontsize: int = 42,
    x_expr: str = "10",
    y_expr: str = "h-th-20",
    enable_expr: str = "",        # ← কতক্ষণ দেখাবে (FFmpeg enable expression)
) -> str:
    """
    Bangla-safe drawtext filter তৈরি করে।
    enable_expr দিলে নির্দিষ্ট সময় পর্যন্ত টেক্সট দেখাবে।
    খালি রাখলে পুরো ক্লিপ জুড়ে দেখাবে।
    
    ব্যবহার:
      enable_expr = "between(t,0,5)"  → শুধু প্রথম ৫ সেকেন্ড
      enable_expr = ""                → পুরো ক্লিপ
    """
    escaped_font = ffmpeg_escape_font_path(font_path)
    escaped_text = ffmpeg_escape_text(text)

    enable_part = f":enable='{enable_expr}'" if enable_expr else ""

    return (
        f"drawtext="
        f"fontfile='{escaped_font}'"
        f":text='{escaped_text}'"
        f":fontcolor=white"
        f":fontsize={fontsize}"
        f":x={x_expr}"
        f":y={y_expr}"
        f":box=1"
        f":boxcolor=black@0.5"
        f":boxborderw=10"
        f":shadowcolor=black@0.8"
        f":shadowx=2"
        f":shadowy=2"
        f"{enable_part}"
    )


def build_watermark_filter(
    text: str,
    font_path: str,
    opacity: float = 0.18,
    x_percent: float = 50.0,
    y_percent: float = 50.0,
    fontsize: int = 36,
) -> str:
    """
    হালকা, প্রায়-অদৃশ্য Watermark টেক্সট তৈরি করে।

    এটা caption/label drawtext থেকে আলাদা:
    - কোনো background box নেই (একদম স্বচ্ছ background)
    - কোনো shadow নেই (একদম হালকা দেখানোর জন্য)
    - Opacity slider দিয়ে নিয়ন্ত্রণ করা যায় (fontcolor এ alpha হিসেবে বসে)
    - Position % হিসেবে দেওয়া হয় (drag এর বদলে) — 0%=একদম বাম/উপর, 100%=ডান/নিচ

    Args:
        text:       Watermark টেক্সট (Bangla/English)।
        font_path:  Bangla font path।
        opacity:    0.0–1.0 (যেমন 0.18 = 18% দৃশ্যমান)।
        x_percent:  অনুভূমিক পজিশন, 0–100 (50 = মাঝখানে)।
        y_percent:  উলম্ব পজিশন, 0–100 (50 = মাঝখানে)।
        fontsize:   ফন্ট সাইজ।

    Returns:
        FFmpeg drawtext filter string (box/shadow ছাড়া, শুধু transparent text)।
    """
    escaped_font = ffmpeg_escape_font_path(font_path)
    escaped_text = ffmpeg_escape_text(text)

    # x/y কে percentage থেকে FFmpeg expression এ রূপান্তর
    # (main_w - text_w) * percent/100  → সঠিক pixel position দেয়
    x_expr = f"(w-tw)*{x_percent/100:.3f}"
    y_expr = f"(h-th)*{y_percent/100:.3f}"

    return (
        f"drawtext="
        f"fontfile='{escaped_font}'"
        f":text='{escaped_text}'"
        f":fontcolor=white@{opacity:.2f}"   # ← আসল transparency এখানে
        f":fontsize={fontsize}"
        f":x={x_expr}"
        f":y={y_expr}"
        # কোনো box/shadow নেই — একদম হালকা, কাগজে জলছাপের মতো
    )


def build_lower_third_filter(
    title_text: str,
    subtitle_text: str,
    font_path: str,
    enable_expr: str = "",
    banner_color: str = "0x1a3d1a",
) -> str:
    """
    Lower-Third Banner তৈরি করে — সাধারণত নিউজ/ডকুমেন্টারি ভিডিওতে দেখা
    যায় এমন তথ্যসূচক ব্যানার, স্ক্রিনের নিচের অংশে বসে।

    caption (label) থেকে আলাদা: এতে একটা রঙিন সলিড ব্যানার box থাকে,
    উপরে বড় শিরোনাম (title) ও নিচে ছোট উপ-শিরোনাম (subtitle) — যেমন
    কারো নাম ও পদবি একসাথে দেখানোর জন্য ব্যবহার হয়।

    Args:
        title_text:    প্রধান লেখা (বড় ফন্ট), যেমন "কমল হোসেন"
        subtitle_text: উপ-লেখা (ছোট ফন্ট), যেমন "মালিক, শাধীনতা ফার্ম"
        font_path:     বাংলা ফন্ট path
        enable_expr:   কতক্ষণ দেখাবে (FFmpeg enable expression, খালি = পুরো ক্লিপ)
        banner_color:  ব্যানারের background রঙ (FFmpeg hex/color name)

    Returns:
        FFmpeg filter string — একটা drawbox (ব্যানার) + দুটো drawtext
        (title ও subtitle) chain করা।
    """
    escaped_font = ffmpeg_escape_font_path(font_path)
    esc_title    = ffmpeg_escape_text(title_text)
    esc_subtitle = ffmpeg_escape_text(subtitle_text)

    enable_part = f":enable='{enable_expr}'" if enable_expr else ""

    # ব্যানার box — স্ক্রিনের নিচ থেকে ১৫% উচ্চতায়, বাম দিক থেকে শুরু, ৪৫% প্রস্থ
    banner_box = (
        f"drawbox=x=0:y=ih*0.78:w=iw*0.55:h=ih*0.14:"
        f"color={banner_color}@0.85:t=fill{enable_part}"
    )

    # Title — ব্যানারের উপরের অংশে, বড় ফন্ট
    title_draw = (
        f"drawtext=fontfile='{escaped_font}':text='{esc_title}':"
        f"fontcolor=white:fontsize=h*0.045:"
        f"x=iw*0.03:y=ih*0.795{enable_part}"
    )

    # Subtitle — ব্যানারের নিচের অংশে, ছোট ফন্ট, হালকা রঙ
    subtitle_draw = (
        f"drawtext=fontfile='{escaped_font}':text='{esc_subtitle}':"
        f"fontcolor=white@0.85:fontsize=h*0.028:"
        f"x=iw*0.03:y=ih*0.85{enable_part}"
    )

    parts = [banner_box, title_draw]
    if subtitle_text.strip():
        parts.append(subtitle_draw)

    return ",".join(parts)


def build_zoompan_filter(
    style: str,
    zoom_strength: float,
    clip_duration: float,
    fps: int,
    out_w: int,
    out_h: int,
) -> str:
    """
    Ken Burns স্টাইল Zoom/Pan filter তৈরি করে (FFmpeg zoompan filter দিয়ে)।

    ৬টা স্টাইল সাপোর্ট করে:
      none      → কোনো effect নেই, খালি string return করে
      zoom_in   → শুরুতে 1.0x, শেষে zoom_strength x পর্যন্ত ধীরে বড় হয়
      zoom_out  → শুরুতে zoom_strength x, শেষে 1.0x তে ধীরে ছোট হয়
      pan_lr    → জুম স্থির রেখে বাম থেকে ডানে সরে
      pan_rl    → জুম স্থির রেখে ডান থেকে বামে সরে
      diagonal  → জুম + কোনাকুনি move (নিচ-বাম → উপর-ডান)

    Args:
        style:         উপরের ৬টার একটা।
        zoom_strength:  সর্বোচ্চ zoom level (যেমন 1.15 = 15% zoom)।
        clip_duration: ক্লিপের total duration (সেকেন্ড), frame count হিসাবের জন্য।
        fps:           Target frame rate।
        out_w, out_h:  Output resolution (zoompan এর s= প্যারামিটারে লাগে)।

    Returns:
        FFmpeg zoompan filter string, অথবা style="none" হলে empty string।
    """
    if style == "none" or zoom_strength <= 1.001:
        return ""

    total_frames = max(1, int(clip_duration * fps))
    z = zoom_strength

    # zoompan এর d= (duration in frames) প্রতিটা zoompan call এর জন্য লাগে
    # zoom এক্সপ্রেশন 'on' (output frame number) ব্যবহার করে ধীরে ধীরে বদলায়

    if style == "zoom_in":
        # zoom 1.0 → z, কেন্দ্র বরাবর
        zoom_expr = f"min(zoom+({z}-1)/{total_frames},{z})"
        x_expr = "iw/2-(iw/zoom/2)"
        y_expr = "ih/2-(ih/zoom/2)"

    elif style == "zoom_out":
        # zoom z → 1.0
        zoom_expr = f"if(eq(on,0),{z},max(zoom-({z}-1)/{total_frames},1))"
        x_expr = "iw/2-(iw/zoom/2)"
        y_expr = "ih/2-(ih/zoom/2)"

    elif style == "pan_lr":
        # জুম স্থির থাকবে (হালকা zoom করে জায়গা তৈরি), বাম থেকে ডানে move
        zoom_expr = f"{z}"
        x_expr = f"(iw-iw/zoom)*(on/{total_frames})"
        y_expr = "ih/2-(ih/zoom/2)"

    elif style == "pan_rl":
        zoom_expr = f"{z}"
        x_expr = f"(iw-iw/zoom)*(1-on/{total_frames})"
        y_expr = "ih/2-(ih/zoom/2)"

    elif style == "diagonal":
        # Zoom in করতে করতে নিচ-বাম থেকে উপর-ডানে move (Ken Burns ক্লাসিক লুক)
        zoom_expr = f"min(zoom+({z}-1)/{total_frames},{z})"
        x_expr = f"(iw-iw/zoom)*(on/{total_frames})"
        y_expr = f"(ih-ih/zoom)*(1-on/{total_frames})"

    else:
        return ""

    return (
        f"zoompan="
        f"z='{zoom_expr}'"
        f":x='{x_expr}'"
        f":y='{y_expr}'"
        f":d={total_frames}"
        f":s={out_w}x{out_h}"
        f":fps={fps}"
    )


# ─────────────────────────────────────────────────────────────────────────────
# ░░░  AUDIO FILTER BUILDER  ░░░
# ─────────────────────────────────────────────────────────────────────────────

def build_voiceover_audio_filter(settings: dict) -> str:
    """
    ১৮টা প্রো-লেভেল অডিও ফিচার সঠিক ক্রমে chain করে একটা AF string বানায়।
    (AI মডেল ছাড়া, শুধু classic FFmpeg DSP ফিল্টার দিয়ে তৈরি)

    প্রসেসিং অর্ডার (গুরুত্বপূর্ণ — ভুল অর্ডারে ফলাফল খারাপ হয়):
    ধাপ  ১. Band-pass Filter   — মানুষের কণ্ঠের বাইরের ফ্রিকোয়েন্সি প্রথমেই বাদ
    ধাপ  ২. Wind Noise Filter  — বাতাসের নিচু কম্পাঙ্কের rumble কাটে
    ধাপ  ৩. Hum Removal        — 50/60Hz বৈদ্যুতিক গুনগুন শব্দ কাটে (notch filter)
    ধাপ  ৪. De-clicker         — ক্লিক/পপ/প্লোসিভ শব্দ মসৃণ করে
    ধাপ  ৫. Vocal EQ           — কণ্ঠ স্পষ্ট করে, muddy কমায়
    ধাপ  ৬. De-esser           — "স/শ" এর তীক্ষ্ণতা কমায়
    ধাপ  ৭. Noise Gate         — নিঃশ্বাস/অবশিষ্ট হিস কাটে
    ধাপ  ৮. Multiband Compressor — bass/mid/treble আলাদাভাবে smooth করে
    ধাপ  ৯. Auto Gain Control  — দূরে/কাছে গেলেও volume automatic ধরে রাখে
    ধাপ ১০. Ambient Ducking Comp — সাধারণ compression, dynamic range আরও স্থির
    ধাপ ১১. Harmonic Exciter   — হালকা উষ্ণতা/চকচকে ভাব যোগ করে
    ধাপ ১২. Stereo Widening    — কণ্ঠ/audio কে প্রশস্ত শোনায় (ঐচ্ছিক)
    ধাপ ১৩. Loudnorm           — সবার শেষে volume সমান করে (EBU R128 -16 LUFS)
    ধাপ ১৪. Echo/Reverb        — ঐচ্ছিক, কবিতা আবৃত্তির জন্য (একদম শেষে, effect হিসেবে)

    Silence Trimmer আলাদাভাবে build_silence_trim_filter() এ প্রসেস হয় কারণ
    এটা duration বদলে দেয় — voiceover mixing এর আগে আলাদা pass এ প্রয়োগ করা ভালো।

    Pitch-Correct (atempo) ও AAC bitrate এখানে না — সেগুলো
    যথাক্রমে build_clip_audio_filter() ও render command এ প্রযোজ্য হয়।
    """
    parts = []
    # ধাপ ০ — AI Noise Removal (RNNoise / arnndn) — সবার আগে, raw audio এর
    # উপর কাজ করলে সবচেয়ে ভালো ফল দেয়। মডেল ফাইল না থাকলে স্কিপ হবে,
    # বাকি সব classic filter স্বাভাবিকভাবে চলবে।
    if settings.get("vo_rnnoise") and os.path.exists(RNNOISE_MODEL_PATH):
        _escaped_model = ffmpeg_escape_font_path(RNNOISE_MODEL_PATH)
        parts.append(f"arnndn=m='{_escaped_model}'")

    # ধাপ ১ — Band-pass (High + Low pass combo)
    # মানুষের কণ্ঠের কার্যকর রেঞ্জ (80Hz–8000Hz) এর বাইরের সবকিছু কেটে ফেলে।
    # এটা সবচেয়ে basic কিন্তু শক্তিশালী noise reduction ধাপ — subsonic rumble
    # এবং অতি-উচ্চ hiss দুটোই একসাথে বাদ দেয়।
    if settings.get("vo_bandpass"):
        low  = float(settings.get("vo_bandpass_low", 80.0))
        high = float(settings.get("vo_bandpass_high", 8000.0))
        parts.append(f"highpass=f={low:.0f},lowpass=f={high:.0f}")

    # ধাপ ২ — Wind Noise Filter
    # মাঠে/খোলা জায়গায় রেকর্ড করলে বাতাস মাইকের ডায়াফ্রামে আঘাত করে যে
    # নিচু কম্পাঙ্কের (সাধারণত 100Hz এর নিচে) "ভোঁ ভোঁ" শব্দ তৈরি করে তা কাটে।
    # highpass filter দিয়েই এটা achieve করা যায়, তবে ভিন্ন cutoff ও steeper slope এ।
    if settings.get("vo_wind_filter"):
        cutoff = float(settings.get("vo_wind_cutoff", 120.0))
        parts.append(f"highpass=f={cutoff:.0f}:poles=2")

    # ধাপ ৩ — Hum Removal (Notch Filter)
    # বৈদ্যুতিক তার/জেনারেটর/মোটরের কারণে নির্দিষ্ট ফ্রিকোয়েন্সিতে (50Hz বাংলাদেশ/
    # ভারতে, 60Hz আমেরিকায়) "গুনগুন" শব্দ হয়। Notch filter দিয়ে ঠিক সেই
    # ফ্রিকোয়েন্সি (ও তার harmonics 2×, 3×) কেটে ফেলি, বাকি সব অক্ষত রাখি।
    if settings.get("vo_hum_removal"):
        hum_f = int(settings.get("vo_hum_freq", 50))
        # মূল frequency + প্রথম ২টা harmonic (তীক্ষ্ণ notch, bandwidth সরু)
        parts.append(
            f"equalizer=f={hum_f}:t=o:width=10:g=-30,"
            f"equalizer=f={hum_f*2}:t=o:width=10:g=-20,"
            f"equalizer=f={hum_f*3}:t=o:width=10:g=-15"
        )

    # ধাপ ৪ — De-clicker: প্লোসিভ (প-ফ-ব) ও মাউথ ক্লিক শব্দ মসৃণ করে
    if settings.get("vo_declicker"):
        parts.append("adeclick=window=55:overlap=75:arorder=2:threshold=2")
        # ধাপ ৪.৫ — Adaptive Noise-Print Denoise (afftdn, track_noise মোড)
    # নয়েজ প্রোফাইল আলাদা করে sample নিতে হয় না — tn=1 দিলে ক্রমাগত
    # ব্যাকগ্রাউন্ড নয়েজ auto-track করে বিয়োগ করে। RNNoise এর backup/extra।
    if settings.get("vo_afftdn"):
        nr = float(settings.get("vo_afftdn_amount", 12.0))
        parts.append(f"afftdn=nr={nr:.1f}:nf=-25:tn=1")

    # ধাপ ৫ — Vocal EQ — স্টুডিও সাউন্ডের জন্য
    if settings.get("vo_eq_enable"):
        parts.append(
            "equalizer=f=80:t=h:width=200:g=-18,"      # Low rumble cut
            "equalizer=f=200:t=o:width=200:g=-2,"       # Muddy bass reduce
            "equalizer=f=2000:t=o:width=1000:g=3,"      # Vocal clarity boost
            "equalizer=f=8000:t=h:width=4000:g=2"       # Air/presence boost
        )

    # ধাপ ৬ — De-esser: "স/শ" এর তীক্ষ্ণতা কমায় (sibilance reduction)
    if settings.get("vo_deesser"):
        freq   = float(settings.get("vo_deesser_freq", 6500.0))
        amount = float(settings.get("vo_deesser_amount", 0.5))
        parts.append(f"deesser=i={amount:.2f}:m=0.5:f={min(1.0, freq/10000):.2f}:s=o")

    # ধাপ ৭ — Noise Gate — নিঃশ্বাস ও অবশিষ্ট mic হিস কাটে
    if settings.get("vo_noise_gate"):
        parts.append(
            "agate=threshold=0.008:attack=10:release=200:ratio=10"
        )

    # ধাপ ৮ — Multiband Compressor (সরলীকৃত)
    # সত্যিকারের multiband compression (asplit দিয়ে low/mid/high আলাদা করে
    # প্রতিটাতে আলাদা compressor বসানো) একটা linear -af চেইনে করা সম্ভব না,
    # কারণ তার জন্য filter_complex ও stream split/merge লাগে যা এই per-track
    # audio pipeline এ জটিলতা বাড়িয়ে দেয়। তার বদলে wide-band acompressor
    # ব্যবহার করি matching threshold/ratio সহ — যা কাছাকাছি ফলাফল দেয়:
    # dynamic range স্থির রাখা, bass/treble কে অতিরিক্ত dominate করতে না দেওয়া।
    if settings.get("vo_multiband"):
        parts.append(
            "acompressor=threshold=0.4:ratio=3:attack=8:release=80:makeup=1.2"
        )

    # ধাপ ৯ — Auto Gain Control (AGC)
    # কণ্ঠ কখনো মাইকের কাছে, কখনো দূরে গেলে volume ওঠানামা করে —
    # speechnorm filter ধীরে ধীরে gain adjust করে সেটা compensate করে,
    # loudnorm এর মতো block-based normalize না করে real-time ধরনের adjust করে।
    if settings.get("vo_agc"):
        parts.append("speechnorm=e=6.25:r=0.0001:l=1")

    # ধাপ ১০ — Ambient Ducking প্রস্তুতি — সাধারণ dynamic compression
    if settings.get("vo_ducking"):
        parts.append(
            "acompressor=threshold=0.5:ratio=4:attack=5:release=50:makeup=1.5"
        )

    # ধাপ ১১ — Harmonic Exciter
    # কণ্ঠে সূক্ষ্ম harmonic distortion যোগ করে যা কানে "উষ্ণ" ও "চকচকে"
    # অনুভূতি দেয় — অনেকটা রেডিও/পডকাস্ট স্টুডিওর সাউন্ডের মতো।
    # aexciter filter না থাকায় হালকা soft-clip saturation দিয়ে সিমুলেট করি।
    if settings.get("vo_exciter"):
        amt = float(settings.get("vo_exciter_amount", 0.15))
        # কম amount এ subtle harmonic content যোগ হয়, বেশি amount এ crunch শোনাবে
        drive = 1.0 + amt * 2.0
        parts.append(f"acontrast=contrast={min(90, int(amt*100+20))}")

    # ধাপ ১২ — Stereo Widening (ঐচ্ছিক)
    # Mono voiceover কে সামান্য stereo প্রশস্ততা দেয় — audio আরও "পূর্ণ" শোনায়।
    if settings.get("vo_stereo_widen"):
        widen = float(settings.get("vo_widen_amount", 1.3))
        parts.append(f"extrastereo=m={widen:.2f}:c=0")

    # ধাপ ১৩ — Loudness Normalization — সবার শেষে, EBU R128 (-16 LUFS)
    # NOTE: যদি Two-Pass Loudnorm mode চালু থাকে (vo_loudnorm_twopass=True),
    # তাহলে loudnorm এখানে যোগ হবে না — সেটা process_voiceover() ফাংশনে
    # আলাদা দুই-পাস হিসেবে প্রয়োগ হয় (অনেক বেশি নিখুঁত ফলাফলের জন্য)।
    if settings.get("vo_loudnorm") and not settings.get("vo_loudnorm_twopass"):
        parts.append("loudnorm=I=-16:TP=-1.5:LRA=11")

    # ধাপ ১৪ — Echo / Reverb — কবিতা আবৃত্তি স্টাইলের জন্য (ঐচ্ছিক)
    if settings.get("vo_echo"):
        delay  = float(settings.get("vo_echo_delay", 60.0))
        decay  = float(settings.get("vo_echo_decay", 0.4))
        delay2 = round(delay * 1.6, 1)
        decay2 = round(decay * 0.5, 2)
        parts.append(
            f"aecho=0.8:0.9:{delay}|{delay2}:{decay}|{decay2}"
        )

    # ধাপ ১৫ — Peak Limiter (Final Safety Net)
    # আগের সব filter (EQ, compressor, exciter, echo ইত্যাদি) মিলিয়ে মাঝে
    # মাঝে হঠাৎ জোরে শব্দ (গরুর ডাক, হাততালি, বজ্রপাত) তৈরি হতে পারে যা
    # speaker এ "ফাটা" (clipping) শব্দ দেয়। Limiter এটা ১০০% আটকায় —
    # সবার শেষে বসে, কোনো শব্দকেই নির্দিষ্ট সীমার (limit) উপরে যেতে দেয় না।
    # এটা compressor থেকে আলাদা: compressor আস্তে আস্তে ভলিউম কমায়,
    # limiter হলো একটা কঠোর "দেয়াল" যা কখনো ভাঙা যাবে না।
    if settings.get("vo_limiter", True):
        limit_level = float(settings.get("vo_limiter_level", 0.95))
        parts.append(f"alimiter=limit={limit_level:.2f}:attack=5:release=50")

    # সবসময় 48kHz resample
    parts.append("aresample=48000")

    return ",".join(parts) if parts else "aresample=48000"


def build_silence_trim_filter(threshold_db: float, min_duration: float) -> str:
    """
    ১৬. Silence Trimmer — ভিডিওর মাঝে দীর্ঘ নীরবতা auto কেটে ফেলে।

    FFmpeg এর silenceremove filter ব্যবহার করে। এটা duration বদলে দেয় বলে
    এটা voiceover mixing pipeline এর একদম শুরুতে, আলাদা pass হিসেবে চালানো হয়
    (build_voiceover_audio_filter এর সাধারণ chain এ না, কারণ সেটা শুধু tone/
    volume বদলায়, duration বদলায় না)।

    Args:
        threshold_db:  এই মানের নিচে হলে "নীরব" ধরা হবে (dB, negative number)।
        min_duration:  এর চেয়ে বেশি সময় নীরব থাকলে তবেই কাটা হবে (সেকেন্ড)।

    Returns:
        FFmpeg silenceremove filter string।
    """
    return (
        f"silenceremove="
        f"start_periods=1:start_duration={min_duration}:start_threshold={threshold_db}dB:"
        f"stop_periods=-1:stop_duration={min_duration}:stop_threshold={threshold_db}dB:"
        f"detection=peak"
    )


def build_clip_audio_filter(speed: float, unmuted: bool, settings: dict) -> str:
    """
    ক্লিপের audio filter তৈরি করে।
    ৫. Pitch-Corrected Speed Filter — atempo দিয়ে pitch ঠিক রেখে speed বাড়ায়।
       atempo range: 0.5 – 2.0 (একবারে সর্বোচ্চ 2.0)
       1.5x speed → atempo=1.5
       2.0x speed → atempo=2.0
    """
    if not unmuted:
        return ""  # muted clip এর audio নেই

    af_parts = []

    # Pitch-corrected speed
    if settings.get("vo_pitch_correct") and abs(speed - 1.0) > 0.05:
        speed = max(0.5, min(2.0, speed))
        af_parts.append(f"atempo={speed:.2f}")

    af_parts.append("aresample=48000")
    return ",".join(af_parts)


# ─────────────────────────────────────────────────────────────────────────────
# ░░░  PER-CLIP PROCESSING  ░░░
# ─────────────────────────────────────────────────────────────────────────────

# ─────────────────────────────────────────────────────────────────────────────
# ░░░  VIDEO STABILIZATION (Deshake)  ░░░
# ─────────────────────────────────────────────────────────────────────────────

def stabilize_clip(
    src: str,
    output_path: str,
    smoothing: int = 15,
    shakiness: int = 5,
    zoom: float = 0.0,
    mode: str = "strong",
    is_preview: bool = False,
) -> bool:
    """
    ভিডিও stabilization করে — দুইটা মোডে:

      mode="strong" (ডিফল্ট): FFmpeg এর 'vidstab' লাইব্রেরি দিয়ে দুই-পাস
          stabilization। শক্তিশালী ফলাফল, কিন্তু ধীর (ভিডিও দুইবার scan
          + encode হয়)। ভারী কাঁপা ফুটেজের জন্য ভালো।

      mode="light": FFmpeg এর built-in 'deshake' filter — single-pass,
          অনেক দ্রুত, কিন্তু কম শক্তিশালী। হালকা কাঁপুনি বা slow PC তে
          দ্রুত preview এর জন্য উপযোগী।

    উভয় ক্ষেত্রেই AI/ML মডেল ছাড়া, শুধু classic motion-vector analysis।

    Args:
        src:          মূল (কাঁচা) ভিডিও ফাইলের path।
        output_path:  Stabilized ভিডিও কোথায় সেভ হবে।
        smoothing:    (শুধু strong মোডে) কতগুলো frame ধরে motion smooth
                      করা হবে। সাধারণ রেঞ্জ 10–30।
        shakiness:    (শুধু strong মোডে) ইনপুট ভিডিও কতটা কাঁপা ধরে নেওয়া
                      হবে (1=প্রায় স্থির, 10=খুব বেশি কাঁপা)।
        zoom:         Stabilize করার সময় frame এর কিনারা যে সামান্য কাটা
                      পড়ে তা পূরণ করতে অতিরিক্ত zoom % (0–20)।
        mode:         "strong" বা "light"।
        is_preview:   Preview হলে দ্রুত/হালকা সেটিংস ব্যবহার হয়।

    Returns:
        True on success, False on failure (fail হলে caller raw clip টাই
        ব্যবহার করবে, stabilization স্কিপ করে)।
    """
    if mode == "light":
        return _stabilize_clip_light(src, output_path, zoom, is_preview)
    return _stabilize_clip_strong(src, output_path, smoothing, shakiness, zoom, is_preview)


def _stabilize_clip_light(
    src: str,
    output_path: str,
    zoom: float = 0.0,
    is_preview: bool = False,
) -> bool:
    """
    হালকা/দ্রুত stabilization — FFmpeg এর built-in 'deshake' filter দিয়ে,
    single-pass (কোনো আলাদা analysis pass লাগে না)। vidstab এর তুলনায়
    কম শক্তিশালী কিন্তু অনেক দ্রুত — slow PC বা preview এর জন্য উপযোগী।
    """
    encoder = "libx264" if is_preview else "h264_nvenc"
    enc_opts = (
        ["-preset", "ultrafast", "-crf", "26"] if is_preview
        else ["-preset", "p4", "-rc", "vbr", "-cq", "20"]
    )

    # deshake এর নিজস্ব সামান্য zoom control আছে rx/ry (search range) দিয়ে,
    # কিন্তু edge crop পূরণের জন্য আমরা আলাদা zoom filter যোগ করি consistency
    # বজায় রাখতে (strong মোডের zoom parameter এর মতোই আচরণ)।
    filters = ["deshake=rx=32:ry=32:edge=mirror"]
    if zoom > 0:
        zoom_factor = 1.0 + (zoom / 100.0)
        filters.append(f"scale=iw*{zoom_factor:.3f}:ih*{zoom_factor:.3f},crop=iw/{zoom_factor:.3f}:ih/{zoom_factor:.3f}")

    cmd = [
        FFMPEG_BIN, "-y",
        "-i", src,
        "-vf", ",".join(filters),
        "-c:v", encoder,
    ] + enc_opts + [
        "-c:a", "copy",
        "-r", str(TARGET_FPS),
        output_path,
    ]

    ok, err = run_ffmpeg(cmd, "stabilize: light mode (deshake)")
    if not ok and ("nvenc" in err.lower() or "no capable devices" in err.lower()):
        ok, _ = run_ffmpeg(nvenc_to_sw_fallback(cmd), "stabilize: light mode SW fallback")

    if not ok:
        log.warning(f"Light stabilization failed, skipping: {err[-300:]}")
        return False
    return True


def _stabilize_clip_strong(
    src: str,
    output_path: str,
    smoothing: int = 15,
    shakiness: int = 5,
    zoom: float = 0.0,
    is_preview: bool = False,
) -> bool:
    """
    শক্তিশালী দুই-পাস stabilization — FFmpeg এর 'vidstab' লাইব্রেরি দিয়ে।
    (আগের stabilize_clip এর মূল লজিক, এখন আলাদা internal ফাংশনে সরানো হলো।)
    """
    trf_path = unique_tmp("vidstab_transform", "trf")

    # ── Pass 1 — Motion Detection ────────────────────────────────────────────
    detect_shakiness = min(shakiness, 3) if is_preview else shakiness

    detect_cmd = [
        FFMPEG_BIN, "-y",
        "-i", src,
        "-vf", f"vidstabdetect=shakiness={detect_shakiness}:accuracy=9:result={trf_path}",
        "-f", "null",
        "-",
    ]
    ok, err = run_ffmpeg(detect_cmd, "stabilize: motion detect (pass 1)")
    if not ok:
        log.warning(f"Stabilization detect pass failed, skipping stabilization: {err[-300:]}")
        try:
            if os.path.exists(trf_path):
                os.remove(trf_path)
        except OSError:
            pass
        return False

    # ── Pass 2 — Transform Application ───────────────────────────────────────
    zoom_expr = f"zoom={zoom}:zoomspeed=0.25" if zoom > 0 else "zoom=0"
    transform_filter = (
        f"vidstabtransform=input={trf_path}:smoothing={smoothing}:{zoom_expr}:"
        f"interpol=linear:crop=black,"
        f"unsharp=5:5:0.8:3:3:0.4"  # সামান্য sharpen — stabilize করার পর ফ্রেম
                                     # কিছুটা soft হয়ে যায়, তা পুষিয়ে দেয়
    )

    encoder = "libx264" if is_preview else "h264_nvenc"
    enc_opts = (
        ["-preset", "ultrafast", "-crf", "26"] if is_preview
        else ["-preset", "p4", "-rc", "vbr", "-cq", "20"]
    )

    transform_cmd = [
        FFMPEG_BIN, "-y",
        "-i", src,
        "-vf", transform_filter,
        "-c:v", encoder,
    ] + enc_opts + [
        "-c:a", "copy",  # অডিও অপরিবর্তিত রাখি, পরে process_single_clip এ প্রসেস হবে
        "-r", str(TARGET_FPS),
        output_path,
    ]

    ok, err = run_ffmpeg(transform_cmd, "stabilize: transform (pass 2)")
    if not ok and ("nvenc" in err.lower() or "no capable devices" in err.lower()):
        ok, _ = run_ffmpeg(nvenc_to_sw_fallback(transform_cmd), "stabilize: transform SW fallback")

    try:
        if os.path.exists(trf_path):
            os.remove(trf_path)
    except OSError:
        pass

    if not ok:
        log.warning(f"Stabilization transform pass failed, skipping stabilization: {err[-300:]}")
        return False

    return True


def check_vidstab_available() -> bool:
    """
    এই FFmpeg বিল্ডে vidstab (libvidstab) filter আছে কিনা যাচাই করে।
    কিছু lightweight FFmpeg বিল্ডে এই লাইব্রেরি বাদ দেওয়া থাকতে পারে,
    তাই ব্যবহারের আগে check করা ভালো — নাহলে সব ক্লিপে stabilization
    silently fail করবে।
    """
    try:
        result = subprocess.run(
            [FFMPEG_BIN, "-filters"],
            capture_output=True, text=True, timeout=15,
        )
        return "vidstabdetect" in result.stdout and "vidstabtransform" in result.stdout
    except Exception:
        return False


def process_single_clip(
    clip_info: dict,
    profile: dict,
    output_path: str,
    logo_path: Optional[str] = None,
    audio_settings: dict = None,
    is_preview: bool = False,
) -> bool:
    """
    একটা ক্লিপ process করে:
    - Scale/crop → FPS lock → speed apply
    - Zoom/Pan (Ken Burns) effect (ঐচ্ছিক, প্রতি ক্লিপে আলাদা)
    - Bangla caption overlay (নির্দিষ্ট সময় বা পুরো ক্লিপ)
    - Watermark overlay (ঐচ্ছিক, হালকা/স্বচ্ছ, প্রতি ক্লিপে আলাদা)
    - Logo burn-in (top-right, 60% opacity)
    - Audio: pitch-corrected speed বা mute
    """
    if audio_settings is None:
        audio_settings = {}

    src        = clip_info["path"]
    unmuted    = clip_info["unmuted"]
    speed      = clip_info.get("speed", st.session_state.get("global_speed", DEFAULT_SPEED))
    label_text = clip_info.get("label", "").strip()

    # ── Stabilization (Deshake) — সবার আগে প্রয়োগ হয় ─────────────────────
    # কারণ এটা raw ফুটেজের motion ঠিক করে; পরের সব filter (scale/zoom/text)
    # এর উপরই কাজ করা উচিত, স্থিরীকৃত ফ্রেমের উপর।
    stabilize_enabled = clip_info.get("stabilize_enable", False)
    stabilized_tmp_path = None
    if stabilize_enabled:
        stabilized_tmp_path = unique_tmp("stabilized", "mp4")
        smoothing = clip_info.get("stabilize_smoothing", 15)
        shakiness = clip_info.get("stabilize_shakiness", 5)
        stab_zoom = clip_info.get("stabilize_zoom", 0.0)
        stab_mode = clip_info.get("stabilize_mode", "strong")
        stab_ok = stabilize_clip(
            src=src,
            output_path=stabilized_tmp_path,
            smoothing=smoothing,
            shakiness=shakiness,
            zoom=stab_zoom,
            mode=stab_mode,
            is_preview=is_preview,
        )
        if stab_ok:
            src = stabilized_tmp_path  # পরের সব processing এই stabilized ফাইলের উপর হবে
        else:
            # Stabilization ব্যর্থ হলে মূল ক্লিপ দিয়েই এগিয়ে যাই — পুরো
            # render বন্ধ করে দেওয়ার দরকার নেই একটা ক্লিপের কারণে।
            log.warning(f"Stabilization skipped for {clip_info['name']} (using original)")
            try:
                if os.path.exists(stabilized_tmp_path):
                    os.remove(stabilized_tmp_path)
            except OSError:
                pass
            stabilized_tmp_path = None

    # টেক্সট কতক্ষণ দেখাবে (0 = পুরো ক্লিপ)
    label_end  = clip_info.get("label_end_time", 0)

    # টেক্সটের position
    text_pos   = clip_info.get("text_pos", "bottom_left")
    pos_map = {
        "bottom_left":  ("10",          "h-th-20"),
        "bottom_center":("(w-tw)/2",    "h-th-20"),
        "top_left":     ("10",          "20"),
        "center":       ("(w-tw)/2",    "(h-th)/2"),
    }
    x_expr, y_expr = pos_map.get(text_pos, ("10", "h-th-20"))

    # ── নির্বাচিত বাংলা ফন্ট (Sidebar থেকে বাছাই করা) ─────────────────────
    font_key = st.session_state.get("selected_bangla_font", DEFAULT_BANGLA_FONT)
    active_font_path = BANGLA_FONTS.get(font_key, BANGLA_FONTS[DEFAULT_BANGLA_FONT])

    # ── Watermark সেটিংস (ঐচ্ছিক, প্রতি ক্লিপে আলাদা) ───────────────────────
    wm_text    = clip_info.get("watermark_text", "").strip()
    wm_opacity = clip_info.get("watermark_opacity", 0.18)
    wm_x       = clip_info.get("watermark_x", 50.0)
    wm_y       = clip_info.get("watermark_y", 50.0)

    # ── Zoom/Pan সেটিংস (ঐচ্ছিক, প্রতি ক্লিপে আলাদা) ───────────────────────
    zoom_style    = clip_info.get("zoom_style", "none")
    zoom_strength = clip_info.get("zoom_strength", 1.0)

    # ── Rotate/Mirror সেটিংস (ঐচ্ছিক, প্রতি ক্লিপে আলাদা) ──────────────────
    rotate_degrees = clip_info.get("rotate_degrees", 0)
    mirror_enabled = clip_info.get("mirror_enable", False)

    # ── Lower-Third Banner সেটিংস (ঐচ্ছিক, প্রতি ক্লিপে আলাদা) ─────────────
    lt_title    = clip_info.get("lower_third_title", "").strip()
    lt_subtitle = clip_info.get("lower_third_subtitle", "").strip()
    lt_end_time = clip_info.get("lower_third_end_time", 0)

    # ── Chroma Key সেটিংস (ঐচ্ছিক, প্রতি ক্লিপে আলাদা) ────────────────────
    chroma_enabled   = clip_info.get("chroma_key_enable", False)
    chroma_color     = clip_info.get("chroma_key_color", "0x00FF00")
    chroma_similarity = clip_info.get("chroma_key_similarity", 0.15)
    chroma_blend     = clip_info.get("chroma_key_blend", 0.05)

    w    = profile["w"]
    h    = profile["h"]
    crop = profile["crop_mode"]

    # ── Encoder selection ────────────────────────────────────────────────────
    if is_preview:
        encoder    = "libx264"
        bitrate    = "2M"
        scale_w, scale_h = w // 4, h // 4
        extra_venc = ["-preset", "ultrafast", "-crf", "28"]
    else:
        encoder    = "h264_nvenc"
        bitrate    = profile["bitrate"]
        scale_w, scale_h = w, h
        extra_venc = ["-preset", "p4", "-rc", "vbr", "-cq", "20"]

    # ── Video filter chain ───────────────────────────────────────────────────
    vf_parts = []

    # Rotate/Mirror — scale এর আগে প্রয়োগ করা উচিত, কারণ 90°/270° rotate
    # করলে width/height পরস্পর বদলে যায়, তাই scale filter সঠিক orientation
    # এর ভিত্তিতে কাজ করবে।
    rm_filter = build_rotate_mirror_filter(rotate_degrees, mirror_enabled)
    if rm_filter:
        vf_parts.append(rm_filter)

    # Chroma Key — scale এর আগে করাই ভালো, যাতে key color এর নির্ভুলতা
    # scaling এর কারণে pixel-blending এ প্রভাবিত না হয়।
    if chroma_enabled:
        vf_parts.append(build_chroma_key_filter(chroma_color, chroma_similarity, chroma_blend))

    vf_parts.append(build_scale_filter(scale_w, scale_h, crop))
    vf_parts.append(f"fps={TARGET_FPS}")

    # Speed: setpts = 1/speed * PTS
    pts_factor = round(1.0 / speed, 4)
    vf_parts.append(f"setpts={pts_factor}*PTS")

    # Zoom/Pan (Ken Burns) — scale এর পরে বসে, কারণ zoompan কে জানা লাগে
    # ক্লিপের final resolution ও duration। speed-adjusted duration ব্যবহার করি
    # যেন zoom পুরো ক্লিপ জুড়ে সমানভাবে হয়।
    if zoom_style != "none" and zoom_strength > 1.001:
        raw_duration = probe_duration(src)
        adjusted_duration = raw_duration / speed if raw_duration > 0 else 5.0
        zp = build_zoompan_filter(
            style=zoom_style,
            zoom_strength=zoom_strength,
            clip_duration=adjusted_duration,
            fps=TARGET_FPS,
            out_w=scale_w,
            out_h=scale_h,
        )
        if zp:
            vf_parts.append(zp)

    # Color Grading — টেক্সট/watermark বসানোর আগে প্রয়োগ করা উচিত, যেন
    # টেক্সটের রঙ (সাদা/কালো box) color grade দ্বারা প্রভাবিত না হয়।
    color_preset = st.session_state.get("color_grade_preset", "none")
    if color_preset != "none":
        cg_filter = build_color_grade_filter(color_preset)
        if cg_filter:
            vf_parts.append(cg_filter)

    # Bangla caption overlay (স্পষ্ট, box+shadow সহ)
    if label_text:
        enable_expr = f"between(t,0,{label_end:.1f})" if label_end > 0 else ""
        dt = build_drawtext_filter(
            text=label_text,
            font_path=active_font_path,
            fontsize=max(28, scale_h // 30),
            x_expr=x_expr,
            y_expr=y_expr,
            enable_expr=enable_expr,
        )
        vf_parts.append(dt)

    # Lower-Third Banner (তথ্যসূচক ব্যানার, নাম/পদবি ইত্যাদির জন্য)
    if lt_title:
        lt_enable_expr = f"between(t,0,{lt_end_time:.1f})" if lt_end_time > 0 else ""
        lt_filter = build_lower_third_filter(
            title_text=lt_title,
            subtitle_text=lt_subtitle,
            font_path=active_font_path,
            enable_expr=lt_enable_expr,
        )
        vf_parts.append(lt_filter)

    # Watermark overlay (হালকা/স্বচ্ছ, প্রতি ক্লিপে আলাদা, ঐচ্ছিক)
    if wm_text:
        wm_filter = build_watermark_filter(
            text=wm_text,
            font_path=active_font_path,
            opacity=wm_opacity,
            x_percent=wm_x,
            y_percent=wm_y,
            fontsize=max(24, scale_h // 35),
        )
        vf_parts.append(wm_filter)

    vf_string = ",".join(vf_parts)

    # ── Region/Object Blur সেটিংস (ঐচ্ছিক, প্রতি ক্লিপে আলাদা) ─────────────
    blur_enabled = clip_info.get("region_blur_enable", False)
    blur_x = clip_info.get("region_blur_x", 10.0)
    blur_y = clip_info.get("region_blur_y", 10.0)
    blur_w = clip_info.get("region_blur_w", 25.0)
    blur_h = clip_info.get("region_blur_h", 25.0)
    blur_strength = clip_info.get("region_blur_strength", 20)
    blur_end_time = clip_info.get("region_blur_end_time", 0)

    # ── Audio filter ─────────────────────────────────────────────────────────
    af_string = build_clip_audio_filter(speed, unmuted, audio_settings)

    # ── Assemble command ─────────────────────────────────────────────────────
    cmd = [FFMPEG_BIN, "-y", "-i", src]

    need_filter_complex = (logo_path and not is_preview) or blur_enabled

    if need_filter_complex:
        fc_parts = [f"[0:v]{vf_string}[vbase]"]
        current_label = "[vbase]"

        # Region Blur — vf_string (scale/zoom/text/watermark) প্রয়োগ হওয়ার
        # *পরে* বসে, যেন blur এর x/y% coordinate final scaled frame এর
        # সাথে মেলে (raw source resolution এর সাথে না)।
        if blur_enabled:
            blur_enable_expr = (
                f"between(t,0,{blur_end_time:.1f})" if blur_end_time > 0 else ""
            )
            blur_fragment = build_region_blur_filter(
                x_percent=blur_x, y_percent=blur_y,
                w_percent=blur_w, h_percent=blur_h,
                blur_strength=blur_strength,
                enable_expr=blur_enable_expr,
            )
            # blur_fragment নিজেই split/overlay করে, তাই label বদলাতে হবে
            fc_parts.append(f"{current_label}{blur_fragment}[vblurred]")
            current_label = "[vblurred]"

        if logo_path and not is_preview:
            fc_parts.append(
                f"[1:v]scale=150:150:force_original_aspect_ratio=decrease,"
                f"format=rgba,colorchannelmixer=aa=0.6[logo]"
            )
            fc_parts.append(f"{current_label}[logo]overlay=W-w-20:20[vout]")
            current_label = "[vout]"
        else:
            fc_parts.append(f"{current_label}null[vout]")
            current_label = "[vout]"

        filter_complex = ";".join(fc_parts)

        if logo_path and not is_preview:
            cmd += ["-i", logo_path]

        cmd += ["-filter_complex", filter_complex, "-map", current_label]
    else:
        cmd += ["-vf", vf_string, "-map", "0:v"]

    if unmuted and af_string:
        cmd += ["-map", "0:a?", "-af", af_string]
        audio_bitrate = "320k" if audio_settings.get("vo_aac_320") else "192k"
        cmd += ["-c:a", "aac", "-b:a", audio_bitrate, "-ar", "48000"]
    else:
        cmd += ["-an"]  # muted

    aac_bitrate_v = "320k" if audio_settings.get("vo_aac_320") else "192k"
    cmd += [
        "-c:v", encoder, "-b:v", bitrate,
        "-r", str(TARGET_FPS), "-pix_fmt", "yuv420p",
    ] + extra_venc + [output_path]

    success, err = run_ffmpeg(cmd, f"clip: {clip_info['name']}")
    if not success and ("nvenc" in err.lower() or "no capable devices" in err.lower()):
        log.warning("NVENC failed → libx264 fallback")
        success, _ = run_ffmpeg(nvenc_to_sw_fallback(cmd), f"clip SW: {clip_info['name']}")

    # Stabilization এর জন্য তৈরি করা intermediate ফাইল পরিষ্কার করা
    if stabilized_tmp_path and os.path.exists(stabilized_tmp_path):
        try:
            os.remove(stabilized_tmp_path)
        except OSError:
            pass

    return success


# ─────────────────────────────────────────────────────────────────────────────
# ░░░  TRANSITION CONCATENATION  ░░░
# ─────────────────────────────────────────────────────────────────────────────

def calculate_adaptive_transition_duration(
    clip1_duration: float,
    clip2_duration: float,
    base_duration: float = XFADE_DURATION,
    min_duration: float = 0.12,
    max_duration: float = 0.6,
) -> float:
    """
    Adaptive Transition Duration — দুইটা ক্লিপের দৈর্ঘ্য অনুযায়ী transition
    এর সময় স্বয়ংক্রিয়ভাবে ছোট/বড় করে।

    যুক্তি: একটা ২ সেকেন্ডের ছোট ক্লিপে ০.৩ সেকেন্ডের transition অনেক বেশি
    সময় "খেয়ে" নেয় (১৫% duration!) এবং দেখতে বেমানান লাগে। কিন্তু একটা
    ১৫ সেকেন্ডের লম্বা ক্লিপে ০.৩s transition খুবই ছোট মনে হয়, সেখানে
    একটু বড় (০.৫s) transition আরও সিনেমাটিক লাগে।

    এই ফাংশন ছোট ক্লিপের ২৫% এর বেশি duration কখনো transition এ ব্যবহার
    করে না (নিরাপত্তার জন্য), এবং overall min/max সীমার মধ্যে রাখে।

    Args:
        clip1_duration:  আগের ক্লিপের দৈর্ঘ্য (সেকেন্ড)।
        clip2_duration:  পরের ক্লিপের দৈর্ঘ্য (সেকেন্ড)।
        base_duration:   ব্যবহারকারীর নির্ধারিত ডিফল্ট duration।
        min_duration:    সর্বনিম্ন duration (এর নিচে গেলে transition
                         চোখেই পড়বে না, "hard cut" এর মতো লাগবে)।
        max_duration:    সর্বোচ্চ duration (এর বেশি হলে ধীর/অলস লাগবে)।

    Returns:
        Adaptive ভাবে হিসাব করা transition duration (সেকেন্ড)।
    """
    shorter_clip = min(clip1_duration, clip2_duration)
    if shorter_clip <= 0:
        return base_duration

    # ছোট ক্লিপের সর্বোচ্চ ২৫% transition এ ব্যবহার করতে দিই
    safe_cap = shorter_clip * 0.25

    adaptive = min(base_duration, safe_cap)
    adaptive = max(min_duration, min(max_duration, adaptive))
    return round(adaptive, 3)


def measure_clip_loudness(clip_path: str) -> Optional[float]:
    """
    Auto-Level Matching এর জন্য — একটা ক্লিপের integrated loudness (LUFS)
    দ্রুত measure করে। এটা full two-pass loudnorm এর মতো নিখুঁত না, কিন্তু
    দুই ক্লিপের মধ্যে আপেক্ষিক volume ফারাক বুঝতে যথেষ্ট, এবং অনেক দ্রুত।

    Args:
        clip_path: যে ক্লিপের audio loudness মাপা হবে।

    Returns:
        Integrated loudness (LUFS, সাধারণত -30 থেকে -5 এর মধ্যে), অথবা
        ব্যর্থ হলে None (তখন caller level matching স্কিপ করবে)।
    """
    cmd = [
        FFMPEG_BIN, "-i", clip_path,
        "-af", "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json",
        "-f", "null", "-",
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        stderr_text = result.stderr
        json_start = stderr_text.rfind("{")
        json_end   = stderr_text.rfind("}") + 1
        if json_start == -1 or json_end == 0:
            return None
        stats = json.loads(stderr_text[json_start:json_end])
        return float(stats.get("input_i", -16))
    except Exception:
        return None


def apply_transitions(
    clip_paths: list,
    output_path: str,
    profile: dict,
    transition_type: str = "fade",
    is_preview: bool = False,
    adaptive_duration: bool = True,
    audio_curve: str = "tri",
    auto_level_match: bool = False,
    whoosh_sfx_path: Optional[str] = None,
    whoosh_volume: float = 0.4,
) -> bool:
    """
    ৫ ধরনের ট্রানজিশন সহ ক্লিপ জোড়া লাগায়:
    fade, hblur (motion blur), slideleft, radial, wiperight

    FFmpeg xfade filter ব্যবহার করে — প্রতিটা ক্লিপের মাঝে transition বসায়।

    প্রফেশনাল-মানের স্মুথ ট্রানজিশনের জন্য ৪টা অতিরিক্ত ফিচার:

    ১. Adaptive Transition Duration — প্রতিটা কাট পয়েন্টে দুই পাশের
       ক্লিপের দৈর্ঘ্য দেখে transition এর সময় auto adjust করে। ছোট ক্লিপে
       ছোট transition, লম্বা ক্লিপে একটু বড়।

    ২. Audio Crossfade Curve — acrossfade এর curve শুধু "linear" না,
       "tri" (triangular, স্বাভাবিক) বা অন্য বক্ররেখা ব্যবহার করে transition
       আরও natural শোনায় (হঠাৎ অর্ধেক ভলিউম না হয়ে ধীরে পরিবর্তিত হয়)।

    ৩. Auto-Level Matching — কাট পয়েন্টের ঠিক আগে/পরের ক্লিপের loudness
       পরিমাপ করে, ফারাক বেশি হলে (>3 LUFS) দুর্বল ক্লিপের volume সামান্য
       বাড়িয়ে/কমিয়ে সমান করে দেয় — transition এ কানে "ধাক্কা" লাগে না।

    ৪. Transition Whoosh SFX — ঐচ্ছিক, প্রতিটা কাট পয়েন্টে একটা হালকা
       sound effect (হুশ/সোয়াশ ধরনের) মিশিয়ে দেয়, visual transition এর
       সাথে sync করে — professional/cinematic অনুভূতি বাড়ায়।

    Args:
        adaptive_duration: True হলে duration ২ ও ৩ এর মধ্যের ফাংশন
                           calculate_adaptive_transition_duration() ব্যবহার
                           করে হিসাব হয়, False হলে ফিক্সড XFADE_DURATION।
        audio_curve:       acrossfade এর curve — "tri" (স্বাভাবিক),
                           "qsin" (মসৃণ), "exp", ইত্যাদি।
        auto_level_match:  True হলে প্রতিটা কাট পয়েন্টে loudness check
                           করে ছোট adjustment করে।
        whoosh_sfx_path:   ঐচ্ছিক whoosh sound effect ফাইল (WAV/MP3)।
                           None হলে কোনো SFX যোগ হবে না।
        whoosh_volume:     Whoosh SFX এর volume (０.0–1.0)।
    """
    n = len(clip_paths)
    if n == 0:
        return False
    if n == 1:
        shutil.copy2(clip_paths[0], output_path)
        return True

    durations = [probe_duration(p) for p in clip_paths]
    # প্রথম ক্লিপ চেক করেই বোঝা যাবে — mute_all থাকলে সবগুলোই audio-বিহীন হবে
    has_audio = probe_has_audio(clip_paths[0])
    filter_parts = []
    input_args   = []
    for p in clip_paths:
        input_args += ["-i", p]

    # ৩. Auto-Level Matching — প্রতিটা ক্লিপের loudness আগে থেকে measure
    # করে রাখি, যাতে প্রতিটা কাট পয়েন্টে তুলনা করা যায়।
    clip_loudness = [None] * n
    if auto_level_match:
        for idx, p in enumerate(clip_paths):
            clip_loudness[idx] = measure_clip_loudness(p)

    cumulative = 0.0
    cur_v = "[0:v]"
    cur_a = "[0:a]" if has_audio else None

    # ১. Adaptive Duration হলে প্রতিটা কাট পয়েন্টের জন্য আলাদা duration,
    # নাহলে সবগুলোতে একই XFADE_DURATION ব্যবহার হবে।
    transition_durations = []

    for i in range(n - 1):
        if adaptive_duration:
            this_xfade_dur = calculate_adaptive_transition_duration(
                durations[i], durations[i + 1]
            )
        else:
            this_xfade_dur = XFADE_DURATION
        transition_durations.append(this_xfade_dur)

        cumulative += durations[i]
        offset = max(0.0, cumulative - this_xfade_dur)
        out_v  = f"[vx{i}]"

        # Video xfade — নির্বাচিত transition type, adaptive duration সহ
        filter_parts.append(
            f"{cur_v}[{i+1}:v]xfade="
            f"transition={transition_type}:"
            f"duration={this_xfade_dur}:"
            f"offset={offset:.3f}"
            f"{out_v}"
        )

        # ২. Audio Crossfade — ক্লিপে audio না থাকলে (mute_all অবস্থায়)
        # এই পুরো ধাপটা স্কিপ হবে, নাহলে "Stream specifier ':a' matches
        # no streams" এরর দিত।
        if has_audio:
            out_a_raw = f"[ax{i}raw]"
            out_a  = f"[ax{i}]"
            filter_parts.append(
                f"{cur_a}[{i+1}:a]acrossfade="
                f"d={this_xfade_dur}:c1={audio_curve}:c2={audio_curve}"
                f"{out_a_raw}"
            )

            # ৩. Auto-Level Matching — এই কাট পয়েন্টের দুই পাশের ক্লিপের
            # loudness ফারাক বেশি হলে (>3 LUFS), দুর্বল দিকটার volume সামান্য
            # adjust করে সমান শোনানোর চেষ্টা করি।
            current_a_label = out_a_raw
            if auto_level_match and clip_loudness[i] is not None and clip_loudness[i + 1] is not None:
                diff = clip_loudness[i + 1] - clip_loudness[i]
                if abs(diff) > 3.0:
                    correction_db = max(-3.0, min(3.0, -diff / 2))
                    filter_parts.append(f"{current_a_label}volume={correction_db:.1f}dB{out_a}")
                    current_a_label = out_a
                else:
                    filter_parts.append(f"{current_a_label}anull{out_a}")
                    current_a_label = out_a
            else:
                filter_parts.append(f"{current_a_label}anull{out_a}")
                current_a_label = out_a

            cur_a = current_a_label

        cur_v = out_v
        cumulative -= this_xfade_dur

    # ৪. Transition Whoosh SFX — audio না থাকলে এটাও প্রযোজ্য না
    whoosh_input_start_idx = n
    if whoosh_sfx_path and has_audio:
        n_transitions = n - 1
        for _ in range(n_transitions):
            input_args += ["-i", whoosh_sfx_path]

        whoosh_cumulative = 0.0
        whoosh_mix_inputs = [cur_a]
        for i in range(n_transitions):
            whoosh_cumulative += durations[i]
            t_dur = transition_durations[i]
            whoosh_offset_ms = int(max(0.0, whoosh_cumulative - t_dur) * 1000)
            whoosh_cumulative -= t_dur

            whoosh_idx = whoosh_input_start_idx + i
            whoosh_label = f"[whoosh{i}]"
            filter_parts.append(
                f"[{whoosh_idx}:a]adelay={whoosh_offset_ms}|{whoosh_offset_ms},"
                f"volume={whoosh_volume:.2f}{whoosh_label}"
            )
            whoosh_mix_inputs.append(whoosh_label)

        final_audio_label = "[afinal]"
        mix_inputs_str = "".join(whoosh_mix_inputs)
        filter_parts.append(
            f"{mix_inputs_str}amix=inputs={len(whoosh_mix_inputs)}:"
            f"duration=first:dropout_transition=2{final_audio_label}"
        )
        cur_a = final_audio_label

    filter_complex = ";".join(filter_parts)

    encoder  = "h264_nvenc" if not is_preview else "libx264"
    bitrate  = profile["bitrate"] if not is_preview else "3M"
    enc_opts = ["-preset", "p4", "-rc", "vbr", "-cq", "20"] if not is_preview else ["-preset", "fast", "-crf", "26"]

    map_args = ["-map", cur_v]
    if has_audio:
        map_args += ["-map", cur_a]
    audio_out_opts = ["-c:a", "aac", "-b:a", "192k", "-ar", "48000"] if has_audio else ["-an"]

    cmd = (
        [FFMPEG_BIN, "-y"] + input_args
        + ["-filter_complex", filter_complex]
        + map_args
        + ["-c:v", encoder, "-b:v", bitrate, "-r", str(TARGET_FPS), "-pix_fmt", "yuv420p"]
        + enc_opts
        + audio_out_opts
        + [output_path]
    )

    success, err = run_ffmpeg(cmd, "transitions concat")
    # শুধু তখনই SW fallback ট্রাই করব যখন আসলেই NVENC ব্যবহার হয়েছিল —
    # নাহলে libx264 (preview) কমান্ডও ভুলভাবে "ঠিক" করতে গিয়ে ভেঙে যাচ্ছিল।
    if not success and "h264_nvenc" in cmd and (
        "nvenc" in err.lower() or "no capable devices" in err.lower() or "cannot load nvcuda" in err.lower()
    ):
        success, _ = run_ffmpeg(nvenc_to_sw_fallback(cmd), "transitions concat SW")
    return success


# ─────────────────────────────────────────────────────────────────────────────
# ░░░  VOICEOVER PROCESSING  ░░░
# ─────────────────────────────────────────────────────────────────────────────

def measure_loudnorm_stats(input_path: str, pre_filter_chain: str = "") -> Optional[dict]:
    """
    Two-Pass Loudnorm এর প্রথম ধাপ — শুধু measurement, কোনো ফাইল লেখে না।

    FFmpeg কে 'print_format=json' সহ loudnorm filter চালাতে বলা হয়, যেটা
    stderr এ পুরো audio বিশ্লেষণ করে JSON আকারে loudness পরিসংখ্যান
    (input_i, input_tp, input_lra, input_thresh, target_offset) দেয়।
    এই তথ্য দ্বিতীয় pass এ (build_two_pass_loudnorm_filter) ব্যবহার করলে
    single-pass loudnorm এর চেয়ে অনেক বেশি নিখুঁত normalize হয় — কারণ
    single-pass অনুমান করে normalize করে, কিন্তু two-pass আগে থেকেই জানে
    আসল audio এর characteristics কী।

    Args:
        input_path:       বিশ্লেষণ করার audio ফাইল।
        pre_filter_chain: Loudnorm measurement এর আগে অন্য কোনো filter
                          (EQ, gate ইত্যাদি) প্রয়োগ করতে চাইলে — যাতে
                          measurement সেই processed audio এর উপর ভিত্তি
                          করে হয়, raw audio এর উপর না।

    Returns:
        dict সহ input_i, input_tp, input_lra, input_thresh, target_offset —
        অথবা measurement ব্যর্থ হলে None (caller তখন single-pass এ fallback
        করবে)।
    """
    af_chain = "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json"
    if pre_filter_chain:
        af_chain = f"{pre_filter_chain},{af_chain}"

    cmd = [
        FFMPEG_BIN, "-y",
        "-i", input_path,
        "-af", af_chain,
        "-f", "null",
        "-",
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        # loudnorm এর JSON output stderr এ আসে, stdout এ না
        stderr_text = result.stderr
        # শেষ '{' থেকে শেষ '}' পর্যন্ত JSON ব্লক বের করি
        json_start = stderr_text.rfind("{")
        json_end   = stderr_text.rfind("}") + 1
        if json_start == -1 or json_end == 0:
            log.warning("Loudnorm measurement: JSON output পাওয়া যায়নি")
            return None
        stats = json.loads(stderr_text[json_start:json_end])
        return stats
    except Exception as e:
        log.warning(f"Loudnorm measurement failed: {e}")
        return None


def build_two_pass_loudnorm_filter(stats: dict) -> str:
    """
    measure_loudnorm_stats() থেকে পাওয়া measurement দিয়ে দ্বিতীয়-পাস
    loudnorm filter string তৈরি করে — এবার আর measure করে না, বরং
    আগে থেকে জানা measured_I/TP/LRA/thresh ব্যবহার করে সরাসরি সঠিক
    normalize প্রয়োগ করে (linear=true মোডে, যা single-pass এর চেয়ে
    precision এ উন্নত)।
    """
    return (
        f"loudnorm=I=-16:TP=-1.5:LRA=11:"
        f"measured_I={stats.get('input_i', -16)}:"
        f"measured_TP={stats.get('input_tp', -1.5)}:"
        f"measured_LRA={stats.get('input_lra', 11)}:"
        f"measured_thresh={stats.get('input_thresh', -30)}:"
        f"offset={stats.get('target_offset', 0)}:"
        f"linear=true"
    )


def process_voiceover(
    voiceover_path: str,
    output_path: str,
    audio_settings: dict,
) -> bool:
    """
    ১৮টা প্রো-অডিও ফিচার voiceover এ apply করে:
    (ঐচ্ছিক) Silence Trim → Bandpass → Wind → Hum → De-click → EQ → De-esser →
    Noise Gate → Multiband Comp → AGC → Ducking Comp → Exciter → Stereo Widen →
    [Loudnorm — single বা two-pass] → Echo → Limiter → Resample

    Two-Pass Loudnorm চালু থাকলে (vo_loudnorm_twopass=True):
      Pass 1: বাকি সব filter (EQ, gate ইত্যাদি) প্রয়োগ করে একটা intermediate
              ফাইল বানানো হয়, তারপর সেই ফাইলের উপর loudnorm measurement
              নেওয়া হয় (measure_loudnorm_stats)।
      Pass 2: সেই measurement দিয়ে সঠিক loudnorm প্রয়োগ করে চূড়ান্ত ফাইল
              তৈরি হয় (build_two_pass_loudnorm_filter)।

    এটা single-pass এর চেয়ে ধীর (দুইবার audio প্রসেস হয়) কিন্তু ফলাফল
    broadcast-standard এর কাছাকাছি নিখুঁত হয়।
    """
    audio_bitrate = "320k" if audio_settings.get("vo_aac_320") else "192k"

    # Silence Trimmer — duration বদলে দেয় বলে filter chain এর সবার শুরুতে
    silence_prefix = ""
    if audio_settings.get("vo_silence_trim"):
        threshold = audio_settings.get("vo_silence_threshold", -35.0)
        min_dur   = audio_settings.get("vo_silence_min_dur", 1.0)
        silence_prefix = build_silence_trim_filter(threshold, min_dur) + ","

    use_two_pass = (
        audio_settings.get("vo_loudnorm") and audio_settings.get("vo_loudnorm_twopass")
    )

    if use_two_pass:
        # ── Pass 1 — বাকি সব filter (loudnorm বাদে) প্রয়োগ করে intermediate ফাইল ──
        af_chain_no_loudnorm = build_voiceover_audio_filter(audio_settings)
        full_chain_pass1 = silence_prefix + af_chain_no_loudnorm

        intermediate_path = unique_tmp("vo_prenorm", "wav")
        cmd_pass1 = [
            FFMPEG_BIN, "-y",
            "-i", voiceover_path,
            "-af", full_chain_pass1,
            "-ar", "48000",
            intermediate_path,
        ]
        ok1, err1 = run_ffmpeg(cmd_pass1, "voiceover processing (pass 1, pre-loudnorm)")
        if not ok1:
            return False

        # ── Measurement — intermediate ফাইলের loudness বিশ্লেষণ ──────────────
        stats = measure_loudnorm_stats(intermediate_path)

        if stats is None:
            # Measurement ব্যর্থ হলে single-pass loudnorm এ fallback করি —
            # যেন পুরো processing আটকে না যায়।
            log.warning("Two-pass measurement failed, falling back to single-pass loudnorm")
            final_af = "loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000"
        else:
            final_af = build_two_pass_loudnorm_filter(stats) + ",aresample=48000"

        # ── Pass 2 — Measured stats দিয়ে সঠিক loudnorm প্রয়োগ ─────────────────
        cmd_pass2 = [
            FFMPEG_BIN, "-y",
            "-i", intermediate_path,
            "-af", final_af,
            "-c:a", "aac",
            "-b:a", audio_bitrate,
            "-ar", "48000",
            output_path,
        ]
        ok2, err2 = run_ffmpeg(cmd_pass2, "voiceover processing (pass 2, loudnorm apply)")

        try:
            os.remove(intermediate_path)
        except OSError:
            pass

        return ok2

    else:
        # ── Single-Pass (আগের মতোই, দ্রুত) ─────────────────────────────────────
        af_chain = silence_prefix + build_voiceover_audio_filter(audio_settings)
        cmd = [
            FFMPEG_BIN, "-y",
            "-i", voiceover_path,
            "-af", af_chain,
            "-c:a", "aac",
            "-b:a", audio_bitrate,
            "-ar",  "48000",
            output_path,
        ]
        return run_ffmpeg(cmd, "voiceover processing (single-pass)")[0]


def apply_lcut_voiceover_mix(
    video_path: str,
    voiceover_path: str,
    output_path: str,
    profile: dict,
    audio_settings: dict,
    bg_music_path: Optional[str] = None,
    bg_music_volume: float = 0.12,
    total_duration: float = 0.0,
    fade_in_sec: float = 0.0,
    fade_out_sec: float = 0.0,
    is_preview: bool = False,
) -> bool:
    """
    ৪. L-Cut (J-Cut) Audio Mixing:
       Voiceover টি ভিডিওর clip audio এর JCUT_OFFSET সেকেন্ড আগে শুরু হয়।
       এতে scene cut এর সময় audio আগে থেকে শুনতে পাওয়া যায় — cinematic feel।

    ৬. Ambient Ducking:
       Clip audio কে volume=0.15 এ রাখা হয় (85% duck) যেন voiceover সবসময়
       প্রাধান্য পায়। Background ambient sound থাকলে শুনতে ভালো লাগে।

    Background Music (ঐচ্ছিক):
       একটা তৃতীয় audio track — voiceover এর নিচে খুব কম volume এ (ডিফল্ট 12%)
       loop করে বাজবে। bg_music_path না দিলে এই স্তরটা স্কিপ হয়।

    Audio Fade In/Out (ঐচ্ছিক):
       ভিডিওর একদম শুরুতে audio আস্তে আস্তে শুরু হয় (fade_in_sec সেকেন্ড ধরে),
       এবং শেষে আস্তে আস্তে মিলিয়ে যায় (fade_out_sec সেকেন্ড ধরে)। এটা পুরো
       mixed audio ([aout]) এর উপর প্রয়োগ হয় — voiceover, clip audio, ও bg
       music সবকিছু একসাথে fade হয়। fade_out এর জন্য total_duration জানা
       দরকার (কোথা থেকে fade শুরু হবে তা বের করতে)।
    """
    jcut_ms = int(JCUT_OFFSET * 1000)
    audio_bitrate = "320k" if audio_settings.get("vo_aac_320") else "192k"

    # ভিডিও ক্লিপে নিজস্ব audio stream আছে কিনা চেক (mute/silent ক্লিপে থাকে না) —
    # না থাকলে [0:a] filter এ পাঠালে FFmpeg "matches no streams" এরর দেয়।
    has_clip_audio = probe_has_audio(video_path)

    inputs = [FFMPEG_BIN, "-y", "-i", video_path, "-i", voiceover_path]

    if bg_music_path:
        # -stream_loop -1 দিয়ে music ভিডিওর চেয়ে ছোট হলেও loop করে পুরো ভিডিও জুড়ে বাজবে
        inputs += ["-stream_loop", "-1", "-i", bg_music_path]

        if has_clip_audio:
            filter_complex = (
                f"[0:a]adelay={jcut_ms}|{jcut_ms},volume=0.15[va];"
                f"[1:a]volume=1.0[vo];"
                f"[2:a]volume={bg_music_volume:.2f}[bgm_raw];"
                # Real sidechain ducking — কথা বললেই music auto নিচে নামবে,
                # চুপ থাকলে normal ভলিউমে ফিরবে (static % ভলিউম-এর বদলে)
                f"[bgm_raw][vo]sidechaincompress=threshold=0.05:ratio=8:attack=5:release=400:makeup=1[bgm];"
                f"[va][vo][bgm]amix=inputs=3:duration=first:dropout_transition=2[aout_raw]"
            )
        else:
            # ক্লিপে audio নেই → শুধু voiceover + bg music মিক্স হবে (va layer বাদ)
            filter_complex = (
                f"[1:a]volume=1.0[vo];"
                f"[2:a]volume={bg_music_volume:.2f}[bgm_raw];"
                f"[bgm_raw][vo]sidechaincompress=threshold=0.05:ratio=8:attack=5:release=400:makeup=1[bgm];"
                f"[vo][bgm]amix=inputs=2:duration=first:dropout_transition=2[aout_raw]"
            )
    else:
        if has_clip_audio:
            filter_complex = (
                f"[0:a]adelay={jcut_ms}|{jcut_ms},volume=0.15[va];"
                f"[1:a]volume=1.0[vo];"
                f"[va][vo]amix=inputs=2:duration=longest:dropout_transition=2[aout_raw]"
            )
        else:
            # ক্লিপে audio নেই, bg music-ও নেই → voiceover-ই একমাত্র audio, মিক্সের দরকার নেই
            filter_complex = f"[1:a]volume=1.0[aout_raw]"

    # Fade In/Out — mixed audio এর উপর প্রয়োগ হয়
    fade_parts = []
    if fade_in_sec > 0:
        fade_parts.append(f"afade=t=in:st=0:d={fade_in_sec:.2f}")
    if fade_out_sec > 0 and total_duration > fade_out_sec:
        fade_start = max(0.0, total_duration - fade_out_sec)
        fade_parts.append(f"afade=t=out:st={fade_start:.2f}:d={fade_out_sec:.2f}")

    if fade_parts:
        fade_chain = ",".join(fade_parts)
        filter_complex += f";[aout_raw]{fade_chain}[aout]"
    else:
        filter_complex += ";[aout_raw]anull[aout]"

    cmd = (
        inputs
        + ["-filter_complex", filter_complex]
        + ["-map", "0:v", "-map", "[aout]"]
        + ["-c:v", "copy"]
        + ["-c:a", "aac", "-b:a", audio_bitrate, "-ar", "48000"]
        + [output_path]
    )

    success, err = run_ffmpeg(cmd, "L-Cut voiceover + BG music mix")
    return success



# ─────────────────────────────────────────────────────────────────────────────
# ░░░  VIDEO SPLIT  ░░░
# ─────────────────────────────────────────────────────────────────────────────

def split_clip(
    clip_info: dict,
    split_times: list,
    output_dir: str,
) -> list:
    """
    একটা ক্লিপকে নির্দিষ্ট সময়ে কেটে একাধিক ক্লিপ বানায়।

    উদাহরণ: ক্লিপ duration = 30s, split_times = [10, 20]
      → segment_0: 0s – 10s
      → segment_1: 10s – 20s
      → segment_2: 20s – 30s

    FFmpeg -ss (start) + -to (end) দিয়ে accurate cut করে।
    -c copy ব্যবহার করে — re-encode নেই, তাই অনেক দ্রুত।

    Args:
        clip_info:   Original clip dict.
        split_times: List of cut points in seconds (e.g. [10.0, 20.5]).
        output_dir:  Where to save the split segments.

    Returns:
        List of new clip dicts (same structure as original clip_info).
        Empty list on failure.
    """
    src      = clip_info["path"]
    duration = probe_duration(src)

    if duration <= 0:
        log.error(f"split_clip: cannot get duration for {src}")
        return []

    # Build segment boundaries: [(start, end), ...]
    cuts = sorted([t for t in split_times if 0 < t < duration])
    boundaries = []
    prev = 0.0
    for t in cuts:
        boundaries.append((prev, t))
        prev = t
    boundaries.append((prev, duration))

    new_clips = []
    base_name = Path(src).stem

    for seg_idx, (start, end) in enumerate(boundaries):
        seg_len = end - start
        if seg_len < 0.1:
            log.warning(f"Skipping segment {seg_idx} — too short ({seg_len:.2f}s)")
            continue

        out_name = f"{base_name}_seg{seg_idx:02d}.mp4"
        out_path = str(Path(output_dir) / out_name)

        # -ss before -i = fast seek (keyframe accurate enough for editing)
        # -to is relative to -ss start when placed after -i
        cmd = [
            FFMPEG_BIN, "-y",
            "-ss", f"{start:.3f}",
            "-i",  src,
            "-to", f"{seg_len:.3f}",
            "-c",  "copy",          # no re-encode → instant
            "-avoid_negative_ts", "make_zero",
            out_path,
        ]
        ok, err = run_ffmpeg(cmd, f"split seg {seg_idx}: {start:.1f}s–{end:.1f}s")
        if not ok:
            log.error(f"Split segment {seg_idx} failed: {err}")
            continue

        # New clip dict inherits all settings from parent
        new_clip = dict(clip_info)
        new_clip["path"]  = out_path
        new_clip["name"]  = out_name
        new_clip["mtime"] = start   # use start time as sort key
        new_clips.append(new_clip)

    return new_clips


# ─────────────────────────────────────────────────────────────────────────────
# ░░░  INTRO / OUTRO GENERATOR  ░░░
# ─────────────────────────────────────────────────────────────────────────────

def generate_intro_outro_clip(
    text_line1: str,
    text_line2: str,
    duration: float,
    profile: dict,
    logo_path: Optional[str],
    font_path: str,
    bg_color: str = "black",
    output_path: str = "",
    social_icons: Optional[dict] = None,
    is_preview: bool = False,
) -> bool:
    """
    একটা static Intro বা Outro ক্লিপ তৈরি করে — কোনো ভিডিও ফুটেজ ছাড়াই,
    শুধু একটা রঙিন background এ বাংলা টেক্সট (২ লাইন পর্যন্ত), ঐচ্ছিক Logo,
    ও ঐচ্ছিক Social Media Icons (Like/Comment/Share/Subscribe) বসিয়ে
    একটা ছোট MP4 বানায়।

    এটা মূলত channel branding card — প্রতিটা ভিডিওর শুরু/শেষে একই রকম
    দেখতে card ব্যবহার করলে channel এর একটা পরিচিত "identity" তৈরি হয়।

    Social Media Icons সম্পর্কে গুরুত্বপূর্ণ কথা:
      এই ফাংশন কোনো icon "তৈরি" করে না — ব্যবহারকারীকে নিজে ৪টা পর্যন্ত
      PNG icon (transparent background সহ) upload করতে হবে (Like থাম্বস
      আপ, Comment বাবল, Share অ্যারো, Subscribe বেল ইত্যাদি)। এই ফাংশন
      শুধু সেই আপলোড করা icon গুলোকে card এর নিচের অংশে সমান দূরত্বে
      পাশাপাশি বসিয়ে দেয়। YouTube/Facebook এর অফিসিয়াল লোগো ব্যবহার
      কপিরাইট-স্পর্শকাতর হতে পারে, তাই generic/নিজস্ব ডিজাইনের icon
      ব্যবহার করাই নিরাপদ ও প্রচলিত রীতি।

    Args:
        text_line1:   প্রধান টেক্সট (বড় ফন্টে, যেমন "শাধীনতা ফার্ম")
        text_line2:   উপ-টেক্সট (ছোট ফন্টে, যেমন "farmerkamol.com")
        duration:     ক্লিপের দৈর্ঘ্য (সেকেন্ড) — intro সাধারণত 3s, outro 4-5s
        profile:      Resolution/bitrate profile
        logo_path:    ঐচ্ছিক লোগো, card এর উপরে বসবে
        font_path:    বাংলা ফন্ট path
        bg_color:     Background রঙ (FFmpeg color name বা hex)
        output_path:  কোথায় সেভ হবে
        social_icons: ঐচ্ছিক dict — {"like": path, "comment": path,
                      "share": path, "subscribe": path} ফরম্যাটে, যেসব
                      key তে path আছে শুধু সেগুলোই দেখানো হবে। None বা
                      খালি dict দিলে কোনো icon বসবে না।
        is_preview:   Preview হলে lower quality

    Returns:
        True on success, False on failure
    """
    if social_icons is None:
        social_icons = {}
    # শুধু যেসব icon এ বাস্তবিক path আছে সেগুলোই ব্যবহার করি
    active_icons = {k: v for k, v in social_icons.items() if v}

    w = profile["w"]
    h = profile["h"]

    encoder  = "libx264" if is_preview else "h264_nvenc"
    bitrate  = "2M" if is_preview else profile["bitrate"]
    enc_opts = (
        ["-preset", "ultrafast", "-crf", "28"] if is_preview
        else ["-preset", "p4", "-rc", "vbr", "-cq", "20"]
    )

    escaped_font = ffmpeg_escape_font_path(font_path)
    esc_line1    = ffmpeg_escape_text(text_line1)
    esc_line2    = ffmpeg_escape_text(text_line2)

    # প্রধান টেক্সট (বড়, মাঝখানে, লোগোর নিচে যদি লোগো থাকে)
    main_font_size = max(48, h // 15)
    sub_font_size  = max(28, h // 30)

    # সোশ্যাল আইকন থাকলে টেক্সটের জন্য জায়গা একটু উপরে সরিয়ে নিচে icon
    # row এর জন্য জায়গা রাখা হয়।
    icon_row_reserved = 160 if active_icons else 0
    logo_offset = 180 if logo_path else 0

    main_y = f"(h-{logo_offset}-{icon_row_reserved})/2-th/2+{logo_offset}"
    sub_y  = f"(h-{logo_offset}-{icon_row_reserved})/2+th+20+{logo_offset}"

    # ── Input ও filter_complex ধাপে ধাপে তৈরি করি ────────────────────────────
    # ইনপুট ক্রম: [0]=background color, [1..N]=logo/icons (যদি থাকে),
    # শেষে audio এর জন্য anullsrc।
    inputs = [
        "-f", "lavfi", "-i", f"color=c={bg_color}:s={w}x{h}:d={duration}:r={TARGET_FPS}",
    ]

    fc_parts = []
    current_label = "[0:v]"
    next_input_idx = 1

    # Logo overlay (উপরে, মাঝখানে)
    if logo_path:
        inputs += ["-i", logo_path]
        logo_idx = next_input_idx
        next_input_idx += 1
        fc_parts.append(
            f"[{logo_idx}:v]scale=200:200:force_original_aspect_ratio=decrease,format=rgba[logo]"
        )
        fc_parts.append(f"{current_label}[logo]overlay=(W-w)/2:80[with_logo]")
        current_label = "[with_logo]"

    # প্রধান ও উপ-টেক্সট
    fc_parts.append(
        f"{current_label}drawtext=fontfile='{escaped_font}':text='{esc_line1}':"
        f"fontcolor=white:fontsize={main_font_size}:x=(w-tw)/2:y={main_y}[t1]"
    )
    fc_parts.append(
        f"[t1]drawtext=fontfile='{escaped_font}':text='{esc_line2}':"
        f"fontcolor=white@0.8:fontsize={sub_font_size}:x=(w-tw)/2:y={sub_y}[t2]"
    )
    current_label = "[t2]"

    # Social Media Icons — নিচের দিকে, সমান দূরত্বে পাশাপাশি সাজানো
    # প্রতিটা icon 90x90px এ scale করে, card এর নিচের ১/৫ অংশে বসানো হয়।
    icon_order = ["like", "comment", "share", "subscribe"]
    icons_to_place = [(name, active_icons[name]) for name in icon_order if name in active_icons]

    if icons_to_place:
        n_icons = len(icons_to_place)
        icon_size = 90
        # সমান দূরত্বে বসানোর জন্য প্রতিটার x position হিসাব করি —
        # পুরো প্রস্থকে (n_icons + 1) ভাগে ভাগ করে প্রতিটা icon এর কেন্দ্র
        # একেকটা বিভাজন বিন্দুতে বসাই।
        icon_y = h - 140  # নিচ থেকে fixed distance

        for i, (icon_name, icon_path) in enumerate(icons_to_place):
            inputs += ["-i", icon_path]
            this_idx = next_input_idx
            next_input_idx += 1

            # এই icon এর x position: (i+1)/(n_icons+1) অনুপাতে প্রস্থ বরাবর
            x_fraction = (i + 1) / (n_icons + 1)
            icon_label = f"icon{i}"
            positioned_label = f"pos_icon{i}"

            fc_parts.append(
                f"[{this_idx}:v]scale={icon_size}:{icon_size}:"
                f"force_original_aspect_ratio=decrease,format=rgba[{icon_label}]"
            )
            fc_parts.append(
                f"{current_label}[{icon_label}]overlay="
                f"(W*{x_fraction:.3f})-({icon_size}/2):{icon_y}[{positioned_label}]"
            )
            current_label = f"[{positioned_label}]"

    fc_parts.append(f"{current_label}null[vout]")

    filter_complex = ";".join(fc_parts)

    inputs += ["-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo"]
    audio_input_idx = next_input_idx

    cmd = (
        [FFMPEG_BIN, "-y"] + inputs
        + ["-filter_complex", filter_complex]
        + ["-map", "[vout]", "-map", f"{audio_input_idx}:a"]
        + ["-c:v", encoder, "-b:v", bitrate, "-r", str(TARGET_FPS), "-pix_fmt", "yuv420p"]
        + enc_opts
        + ["-c:a", "aac", "-b:a", "192k", "-shortest", "-t", str(duration)]
        + [output_path]
    )

    success, err = run_ffmpeg(cmd, "intro/outro generation")
    if not success and ("nvenc" in err.lower() or "no capable devices" in err.lower()):
        success, _ = run_ffmpeg(nvenc_to_sw_fallback(cmd), "intro/outro SW fallback")
    return success


# ─────────────────────────────────────────────────────────────────────────────
# ░░░  COLOR GRADING  ░░░
# ─────────────────────────────────────────────────────────────────────────────

def build_color_grade_filter(preset: str) -> str:
    """
    Color Grading Preset এর জন্য FFmpeg 'eq' ও 'colorbalance' filter তৈরি করে।

    প্রতিটা preset brightness/contrast/saturation/gamma এর একটা নির্দিষ্ট
    combination — এগুলো কোনো AI/ML মডেল ব্যবহার করে না, শুধু classic
    color correction filter দিয়ে তৈরি একটা "look"।

    Presets:
      none            → কোনো পরিবর্তন নেই
      warm_farm       → হালকা কমলা/হলুদ টোন, farm/harvest এর উষ্ণ অনুভূতি
      golden_hour     → শক্তিশালী কমলা-সোনালি টোন, সূর্যাস্তের মতো
      vivid_green     → সবুজ boost, ফসল/গাছপালা আরও প্রাণবন্ত দেখাবে
      soft_cinematic  → কম saturation, নরম contrast, সিনেমাটিক muted look

    Returns:
        FFmpeg video filter string, বা preset="none" হলে খালি string
    """
    if preset == "none":
        return ""

    presets = {
        # brightness, contrast, saturation, gamma_r, gamma_g, gamma_b
        "warm_farm": {
            "eq": "brightness=0.02:contrast=1.08:saturation=1.15",
            "colorbalance": "rs=0.08:gs=0.02:bs=-0.08:rm=0.05:bm=-0.05",
        },
        "golden_hour": {
            "eq": "brightness=0.04:contrast=1.12:saturation=1.25:gamma_r=1.08:gamma_b=0.92",
            "colorbalance": "rs=0.15:gs=0.05:bs=-0.15:rm=0.10:bm=-0.10",
        },
        "vivid_green": {
            "eq": "brightness=0.0:contrast=1.10:saturation=1.35",
            "colorbalance": "gs=0.12:gm=0.08:gh=0.05",
        },
        "soft_cinematic": {
            "eq": "brightness=-0.02:contrast=0.95:saturation=0.85:gamma=1.05",
            "colorbalance": "rs=0.03:bs=0.05:rm=0.02:bm=0.03",
        },
    }

    p = presets.get(preset)
    if not p:
        return ""

    return f"eq={p['eq']},colorbalance={p['colorbalance']}"


def build_chroma_key_filter(
    key_color: str = "0x00FF00",
    similarity: float = 0.15,
    blend: float = 0.05,
) -> str:
    """
    Chroma Key (Green Screen Removal) — নির্দিষ্ট রঙ (সাধারণত সবুজ/নীল)
    ভিডিও থেকে সরিয়ে transparent করে দেয়, যাতে পেছনে অন্য background
    বসানো যায়।

    এটা FFmpeg এর নিজস্ব 'chromakey' filter দিয়ে হয় — কোনো AI segmentation
    লাগে না, শুধু নির্দিষ্ট রঙের pixel range detect করে সরানো হয় (তাই
    সত্যিকারের green screen/uniform background দরকার, ঘরোয়া/farm ফুটেজে
    এটা কার্যকর হবে না)।

    Args:
        key_color:   যে রঙ সরানো হবে (hex format, ডিফল্ট সবুজ 0x00FF00)।
        similarity:  কতটা কাছাকাছি রঙ ধরা হবে (0.01–0.5, বেশি = বেশি সরাবে
                     কিন্তু subject এর রঙেও প্রভাব ফেলতে পারে)।
        blend:       কিনারা কতটা soft/blend হবে (0.0–0.5, বেশি = মসৃণ edge)।

    Returns:
        FFmpeg chromakey filter string। ব্যবহারের পর background overlay
        করতে হলে filter_complex এ [বেসিক ব্যাকগ্রাউন্ড][chromakeyed video]
        overlay করতে হবে — এটা শুধু transparency তৈরি করে দেয়।
    """
    return f"chromakey={key_color}:similarity={similarity:.2f}:blend={blend:.2f}"


def build_region_blur_filter(
    x_percent: float,
    y_percent: float,
    w_percent: float,
    h_percent: float,
    blur_strength: int = 20,
    enable_expr: str = "",
) -> str:
    """
    Region/Object Blur (Privacy Mask) — ফ্রেমের একটা নির্দিষ্ট আয়তক্ষেত্র
    (rectangle) অংশ ঝাপসা/blur করে দেয়। গাড়ির নম্বরপ্লেট, মুখ, বা কোনো
    sensitive বস্তু আড়াল করতে ব্যবহার হয়।

    গুরুত্বপূর্ণ সীমাবদ্ধতা: এটা একটা **স্থির (static) অঞ্চল** ব্লার করে —
    পুরো ক্লিপ জুড়ে একই জায়গায় থাকে। যদি বিষয়বস্তু (যেমন মুখ) নড়াচড়া
    করে, তাহলে blur সেই নড়াচড়া "ট্র্যাক" করবে না — এর জন্য AI object
    tracking লাগত, যা এই টুলে ইচ্ছাকৃতভাবে বাদ দেওয়া হয়েছে। তাই এটা
    সবচেয়ে ভালো কাজ করে যেখানে বিষয়বস্তু মোটামুটি স্থির থাকে (যেমন একটা
    সাইনবোর্ড, দাঁড়িয়ে থাকা কেউ, বা লাইসেন্স প্লেট)।

    কৌশল: FFmpeg এর filter_complex দিয়ে মূল ফ্রেম থেকে একটা crop করা
    অংশে boxblur প্রয়োগ করে সেটা আবার একই জায়গায় overlay করা হয় — বাকি
    ফ্রেম অপরিবর্তিত থাকে, শুধু নির্দিষ্ট অংশটাই ঝাপসা হয়।

    Args:
        x_percent, y_percent: ব্লার-করা অঞ্চলের উপরের-বাম কোণার অবস্থান,
                               ফ্রেমের শতাংশ হিসেবে (0–100)।
        w_percent, h_percent: ব্লার-করা অঞ্চলের প্রস্থ ও উচ্চতা, ফ্রেমের
                               শতাংশ হিসেবে (0–100)।
        blur_strength:        Blur এর তীব্রতা (5–50, বেশি = আরও ঝাপসা)।
        enable_expr:          কতক্ষণ ব্লার থাকবে (FFmpeg enable expression,
                               খালি হলে পুরো ক্লিপ জুড়ে)।

    Returns:
        filter_complex এর জন্য একটা fragment — caller কে এটা মূল ভিডিও
        stream এর সাথে সঠিকভাবে chain করতে হবে (দেখুন process_single_clip
        এ ব্যবহারের ধরন)।
    """
    enable_part = f":enable='{enable_expr}'" if enable_expr else ""

    # crop করে, blur করে, তারপর ঠিক একই জায়গায় ফেরত overlay করি
    return (
        f"split[main][tocrop];"
        f"[tocrop]crop=w=iw*{w_percent/100:.3f}:h=ih*{h_percent/100:.3f}:"
        f"x=iw*{x_percent/100:.3f}:y=ih*{y_percent/100:.3f},"
        f"boxblur={blur_strength}:{blur_strength // 2}[blurred];"
        f"[main][blurred]overlay=x=W*{x_percent/100:.3f}:y=H*{y_percent/100:.3f}{enable_part}"
    )


# ─────────────────────────────────────────────────────────────────────────────
# ░░░  SUBTITLE (.SRT) EXPORT  ░░░
# ─────────────────────────────────────────────────────────────────────────────

def seconds_to_srt_timestamp(seconds: float) -> str:
    """
    Float সেকেন্ডকে SRT ফরম্যাটের timestamp এ রূপান্তর করে।
    Format: HH:MM:SS,mmm  (যেমন 00:01:23,456)
    """
    if seconds < 0:
        seconds = 0
    hours   = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs    = int(seconds % 60)
    millis  = int(round((seconds - int(seconds)) * 1000))
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"


def generate_srt_from_clips(
    clips: list,
    intro_duration: float = 0.0,
) -> str:
    """
    ক্লিপের caption (label) টেক্সটগুলো থেকে একটা সম্পূর্ণ .srt সাবটাইটেল
    ফাইল তৈরি করে — আলাদাভাবে টাইপ করতে হয় না, ক্লিপে যা লেখা আছে তাই ব্যবহার হয়।

    গুরুত্বপূর্ণ: প্রতিটা ক্লিপের timeline position হিসাব করতে হবে
    final ভিডিওতে সেই ক্লিপ কখন শুরু হচ্ছে সেটা বের করে। যেহেতু transition
    (xfade) প্রতি ক্লিপের মাঝে সময় কিছুটা "খেয়ে নেয়" (overlap করে), তাই
    XFADE_DURATION বিয়োগ করে cumulative timing হিসাব করা হয় — যাতে
    caption সময়মতো ভিডিওর সাথে sync থাকে।

    Args:
        clips:          ক্লিপ লিস্ট (speed, label, label_end_time সহ)
        intro_duration: যদি Intro clip থাকে, তার দৈর্ঘ্য (timeline shift এর জন্য)

    Returns:
        সম্পূর্ণ .srt ফাইলের content (string হিসেবে) — খালি string যদি
        কোনো ক্লিপেই caption না থাকে।
    """
    srt_lines = []
    entry_num = 1
    cumulative_time = intro_duration  # Intro থাকলে timeline shift করে শুরু

    for clip in clips:
        speed = clip.get("speed", DEFAULT_SPEED)
        if clip.get("unmuted"):
            speed = 1.0  # Unmuted ক্লিপ সবসময় normal speed এ চলে

        raw_duration = probe_duration(clip["path"])
        # Speed-adjusted duration — কারণ ভিডিওতে ক্লিপ কতক্ষণ আসলে দেখা যাবে
        # সেটাই caption timing এর জন্য গুরুত্বপূর্ণ, raw duration না।
        adjusted_duration = raw_duration / speed if raw_duration > 0 else 0

        label = clip.get("label", "").strip()
        if label:
            label_end_time = clip.get("label_end_time", 0)
            # 0 মানে পুরো ক্লিপ জুড়ে দেখাবে, নাহলে নির্দিষ্ট সময় পর্যন্ত
            caption_duration = label_end_time if label_end_time > 0 else adjusted_duration
            caption_duration = min(caption_duration, adjusted_duration)

            start_time = cumulative_time
            end_time   = cumulative_time + caption_duration

            srt_lines.append(str(entry_num))
            srt_lines.append(
                f"{seconds_to_srt_timestamp(start_time)} --> "
                f"{seconds_to_srt_timestamp(end_time)}"
            )
            srt_lines.append(label)
            srt_lines.append("")  # খালি লাইন — SRT entry separator
            entry_num += 1

        # পরের ক্লিপের timeline শুরুর সময় হিসাব — transition overlap বিয়োগ করে
        cumulative_time += adjusted_duration - XFADE_DURATION

    return "\n".join(srt_lines)


def seconds_to_youtube_chapter_timestamp(seconds: float) -> str:
    """
    Float সেকেন্ডকে YouTube chapter format এ রূপান্তর করে।
    ১ ঘণ্টার কম হলে MM:SS, তার বেশি হলে HH:MM:SS।
    (YouTube description এ এই ফরম্যাট আবশ্যক, না হলে chapter ধরবে না)
    """
    if seconds < 0:
        seconds = 0
    hours   = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs    = int(seconds % 60)
    if hours > 0:
        return f"{hours}:{minutes:02d}:{secs:02d}"
    return f"{minutes}:{secs:02d}"


def generate_youtube_chapters_from_clips(
    clips: list,
    intro_duration: float = 0.0,
) -> str:
    """
    ক্লিপের caption (label) টেক্সট থেকে YouTube-ready chapter list তৈরি
    করে — এটা .srt এর মতো ভিডিওর ভেতরে বসে না, বরং একটা টেক্সট যা
    সরাসরি YouTube video description এ paste করা যায়।

    YouTube নিয়ম: প্রথম chapter অবশ্যই 0:00 থেকে শুরু হতে হবে, এবং
    কমপক্ষে ৩টা chapter থাকতে হবে (নাহলে YouTube chapter bar দেখাবে না)।
    যেসব ক্লিপে caption নেই সেগুলো চাপ্টার হিসেবে গণ্য হয় না, শুধু
    caption-যুক্ত ক্লিপগুলোই chapter entry পায়।

    Args:
        clips:          ক্লিপ লিস্ট (speed, label সহ)
        intro_duration: Intro card থাকলে তার দৈর্ঘ্য (timeline shift এর জন্য)

    Returns:
        Multi-line string, প্রতি লাইনে "TIMESTAMP Label" ফরম্যাটে —
        সরাসরি YouTube description এ কপি-পেস্ট করা যায়। কোনো caption
        না থাকলে খালি string।
    """
    chapter_lines = []
    cumulative_time = intro_duration
    first_entry = True

    for clip in clips:
        speed = clip.get("speed", DEFAULT_SPEED)
        if clip.get("unmuted"):
            speed = 1.0

        raw_duration = probe_duration(clip["path"])
        adjusted_duration = raw_duration / speed if raw_duration > 0 else 0

        label = clip.get("label", "").strip()
        if label:
            # YouTube এর নিয়ম অনুযায়ী প্রথম chapter অবশ্যই 0:00 হতে হবে
            timestamp_sec = 0.0 if first_entry else cumulative_time
            ts = seconds_to_youtube_chapter_timestamp(timestamp_sec)
            chapter_lines.append(f"{ts} {label}")
            first_entry = False

        cumulative_time += adjusted_duration - XFADE_DURATION

    # কমপক্ষে ৩টা chapter না থাকলে YouTube chapter bar দেখাবে না — এই
    # ব্যাপারে ব্যবহারকারীকে সতর্ক করা হয় UI তে, এখানে শুধু যা আছে তা রিটার্ন করি।
    return "\n".join(chapter_lines)


# ─────────────────────────────────────────────────────────────────────────────
# ░░░  PRESET SAVE / LOAD (JSON)  ░░░
# ─────────────────────────────────────────────────────────────────────────────

def export_settings_preset() -> dict:
    """
    বর্তমান সব সেটিংস (audio, transition, speed, ফন্ট, color grade ইত্যাদি —
    কিন্তু ক্লিপ-নির্দিষ্ট ডেটা যেমন label/watermark টেক্সট বাদে) একটা
    dictionary এ সংগ্রহ করে — এটাই পরে JSON ফাইল হিসেবে save হবে এবং
    ভবিষ্যতে "Load Preset" দিয়ে ফিরিয়ে আনা যাবে।

    Returns:
        JSON-serializable dict — সব sidebar সেটিংস ধারণ করে।
    """
    keys_to_save = [
        "transition_type", "global_speed", "bg_music_enable", "bg_music_volume",
        "selected_bangla_font",
        "vo_eq_enable", "vo_noise_gate", "vo_loudnorm", "vo_ducking",
        "vo_rnnoise",
        "vo_loudnorm_twopass", "vo_limiter", "vo_limiter_level",
        "vo_lcut", "vo_pitch_correct", "vo_aac_320",
        "vo_echo", "vo_echo_delay", "vo_echo_decay",
        "vo_declicker", "vo_deesser", "vo_deesser_freq", "vo_deesser_amount",
        "vo_bandpass", "vo_bandpass_low", "vo_bandpass_high",
        "vo_wind_filter", "vo_wind_cutoff",
        "vo_hum_removal", "vo_hum_freq",
        "vo_afftdn", "vo_afftdn_amount",
        "vo_multiband", "vo_agc",
        "vo_exciter", "vo_exciter_amount",
        "vo_stereo_widen", "vo_widen_amount",
        "vo_silence_trim", "vo_silence_threshold", "vo_silence_min_dur",
        "color_grade_preset",
        "intro_enable", "intro_text1", "intro_text2", "intro_duration",
        "outro_enable", "outro_text1", "outro_text2", "outro_duration",
        "srt_export_enable",
        "chapter_export_enable",
        "batch_export_enable", "batch_profiles_selected",
        "audio_fade_in_enable", "audio_fade_in_sec",
        "audio_fade_out_enable", "audio_fade_out_sec",
        "transition_adaptive_duration", "transition_audio_curve",
        "transition_auto_level_match", "transition_whoosh_enable",
        "transition_whoosh_volume",
    ]
    preset = {}
    for key in keys_to_save:
        if key in st.session_state:
            preset[key] = st.session_state[key]
    preset["_preset_version"] = "1.0"
    preset["_saved_at"] = datetime.now().isoformat()
    return preset


def import_settings_preset(preset: dict) -> int:
    """
    JSON থেকে লোড করা preset dict কে session_state এ প্রয়োগ করে।

    Args:
        preset: export_settings_preset() থেকে পাওয়া বা .json ফাইল থেকে
                পড়া dictionary।

    Returns:
        কতগুলো key সফলভাবে apply করা হলো (metadata বাদে)।
    """
    applied = 0
    for key, value in preset.items():
        if key.startswith("_"):
            continue  # মেটাডেটা (version, saved_at) স্কিপ
        st.session_state[key] = value
        applied += 1
    return applied


# ─────────────────────────────────────────────────────────────────────────────
# ░░░  MAIN RENDER PIPELINE  ░░░
# ─────────────────────────────────────────────────────────────────────────────

def render_pipeline(
    clips: list,
    voiceover_path: Optional[str],
    logo_path: Optional[str],
    profile: dict,
    transition_type: str,
    audio_settings: dict,
    bg_music_path: Optional[str] = None,
    bg_music_volume: float = 0.12,
    is_preview: bool = False,
) -> tuple[bool, str, str]:
    """
    পুরো render pipeline:
    Phase 0: Intro clip generate (ঐচ্ছিক)
    Phase 1: প্রতিটা ক্লিপ আলাদাভাবে process (zoom/pan, watermark, caption, color grade সহ)
    Phase 2: ট্রানজিশন সহ জোড়া লাগানো (শুধু মূল ক্লিপগুলোর মাঝে)
    Phase 2.5: Outro clip generate (ঐচ্ছিক) + Intro/Outro কে hard-cut দিয়ে জোড়া
    Phase 3: Voiceover process (EQ + Gate + Norm + Compress + সব নতুন ফিল্টার)
    Phase 4: L-Cut audio mix + Ambient ducking + Background music (ঐচ্ছিক)
    Phase 5: SRT সাবটাইটেল ফাইল generate (ঐচ্ছিক, caption থেকে auto তৈরি)
    """
    ensure_dirs()
    if not clips:
        return False, "", "কোনো ক্লিপ নেই!"

    timestamp   = datetime.now().strftime("%Y%m%d_%H%M%S")
    quality_tag = "preview" if is_preview else "final"

    # ── Phase 0 — Intro তৈরি (ঐচ্ছিক) ──────────────────────────────────────
    intro_path = None
    intro_duration_used = 0.0
    if st.session_state.get("intro_enable"):
        st.info("🎬 Intro card তৈরি হচ্ছে...")
        intro_path = unique_tmp("intro", "mp4")
        font_key = st.session_state.get("selected_bangla_font", DEFAULT_BANGLA_FONT)
        active_font = BANGLA_FONTS.get(font_key, BANGLA_FONTS[DEFAULT_BANGLA_FONT])
        intro_dur = float(st.session_state.get("intro_duration", DEFAULT_INTRO_DURATION))
        ok = generate_intro_outro_clip(
            text_line1=st.session_state.get("intro_text1", ""),
            text_line2=st.session_state.get("intro_text2", ""),
            duration=intro_dur,
            profile=profile,
            logo_path=logo_path,
            font_path=active_font,
            bg_color=st.session_state.get("intro_bg_color", "black"),
            output_path=intro_path,
            is_preview=is_preview,
        )
        if not ok:
            return False, "", "Intro card তৈরি করা যায়নি।"
        intro_duration_used = intro_dur

    # ── Phase 1 ──────────────────────────────────────────────────────────────
    processed = []
    progress  = st.progress(0, text="ক্লিপ process হচ্ছে...")

    for idx, clip in enumerate(clips):
        progress.progress((idx + 1) / len(clips),
                          text=f"ক্লিপ {idx+1}/{len(clips)}: {clip['name']}")
        out = unique_tmp(f"clip_{idx:03d}", "mp4")
        ok  = process_single_clip(
            clip_info=clip, profile=profile, output_path=out,
            logo_path=logo_path, audio_settings=audio_settings,
            is_preview=is_preview,
        )
        if not ok:
            progress.empty()
            return False, "", f"ক্লিপ process failed: {clip['name']}"
        processed.append(out)

    progress.progress(1.0, text="সব ক্লিপ process সম্পন্ন ✓")

    # ── Phase 2 — মূল ক্লিপগুলোর মাঝে transition ───────────────────────────
    st.info(f"🎬 ট্রানজিশন apply হচ্ছে ({transition_type})...")
    xfade_out = unique_tmp(f"xfade_{quality_tag}", "mp4")

    # Transition Whoosh SFX — ব্যবহারকারী upload করলে সেই path ব্যবহার হবে
    whoosh_path = st.session_state.get("transition_whoosh_path") if st.session_state.get("transition_whoosh_enable") else None

    ok = apply_transitions(
        clip_paths=processed, output_path=xfade_out,
        profile=profile, transition_type=transition_type,
        adaptive_duration=st.session_state.get("transition_adaptive_duration", True),
        audio_curve=st.session_state.get("transition_audio_curve", "tri"),
        auto_level_match=st.session_state.get("transition_auto_level_match", False),
        whoosh_sfx_path=whoosh_path,
        whoosh_volume=st.session_state.get("transition_whoosh_volume", 0.4),
        is_preview=is_preview,
    )
    for p in processed:
        try: os.remove(p)
        except: pass

    if not ok:
        return False, "", "ট্রানজিশন concat failed."

    # ── Phase 2.5 — Outro তৈরি ও Intro/Outro কে hard-cut এ জোড়া ────────────
    # Intro/Outro branding card গুলো মূল কন্টেন্টের সাথে crossfade না করে
    # সরাসরি (hard cut) জোড়া হয় — কারণ এগুলো একটা আলাদা "সেগমেন্ট" হিসেবে
    # পরিষ্কারভাবে আলাদা দেখানোই উদ্দেশ্য, মিশে যাওয়া না।
    body_with_intro_outro = xfade_out
    outro_duration_used = 0.0

    if st.session_state.get("outro_enable") or intro_path:
        outro_path = None
        if st.session_state.get("outro_enable"):
            st.info("🎬 Outro card তৈরি হচ্ছে...")
            outro_path = unique_tmp("outro", "mp4")
            font_key = st.session_state.get("selected_bangla_font", DEFAULT_BANGLA_FONT)
            active_font = BANGLA_FONTS.get(font_key, BANGLA_FONTS[DEFAULT_BANGLA_FONT])
            outro_dur = float(st.session_state.get("outro_duration", DEFAULT_OUTRO_DURATION))

            # Social Media Icons — শুধু Outro তে ব্যবহার হয় (Intro তে না,
            # কারণ ভিডিও শেষে "Like/Subscribe করুন" বলা স্বাভাবিক, শুরুতে না)
            social_icons_dict = {
                "like":       st.session_state.get("social_icon_like_path"),
                "comment":    st.session_state.get("social_icon_comment_path"),
                "share":      st.session_state.get("social_icon_share_path"),
                "subscribe":  st.session_state.get("social_icon_subscribe_path"),
            }

            ok = generate_intro_outro_clip(
                text_line1=st.session_state.get("outro_text1", ""),
                text_line2=st.session_state.get("outro_text2", ""),
                duration=outro_dur,
                profile=profile,
                logo_path=logo_path,
                font_path=active_font,
                bg_color=st.session_state.get("outro_bg_color", "black"),
                output_path=outro_path,
                social_icons=social_icons_dict,
                is_preview=is_preview,
            )
            if not ok:
                return False, "", "Outro card তৈরি করা যায়নি।"
            outro_duration_used = outro_dur

        # Concat list তৈরি — FFmpeg concat demuxer ব্যবহার করে (hard cut, re-encode ছাড়া দ্রুত)
        concat_parts = []
        if intro_path:
            concat_parts.append(intro_path)
        concat_parts.append(xfade_out)
        if outro_path:
            concat_parts.append(outro_path)

        combined_out = unique_tmp(f"with_intro_outro_{quality_tag}", "mp4")
        concat_list_file = unique_tmp("concat_list", "txt")
        with open(concat_list_file, "w", encoding="utf-8") as f:
            for p in concat_parts:
                # FFmpeg concat demuxer এর জন্য path কে escape করা প্রয়োজন
                safe_path = p.replace("'", "'\\''")
                f.write(f"file '{safe_path}'\n")

        concat_cmd = [
            FFMPEG_BIN, "-y",
            "-f", "concat", "-safe", "0",
            "-i", concat_list_file,
            "-c", "copy",
            combined_out,
        ]
        ok, err = run_ffmpeg(concat_cmd, "intro/outro hard-cut concat")

        # যদি -c copy ব্যর্থ হয় (codec mismatch), re-encode fallback করি
        if not ok:
            log.warning("Concat copy failed, re-encoding fallback...")
            encoder = "h264_nvenc" if not is_preview else "libx264"
            bitrate = profile["bitrate"] if not is_preview else "3M"
            enc_opts = (["-preset", "p4", "-rc", "vbr", "-cq", "20"] if not is_preview
                       else ["-preset", "fast", "-crf", "26"])
            concat_cmd_reencode = [
                FFMPEG_BIN, "-y",
                "-f", "concat", "-safe", "0",
                "-i", concat_list_file,
                "-c:v", encoder, "-b:v", bitrate, "-r", str(TARGET_FPS), "-pix_fmt", "yuv420p",
            ] + enc_opts + ["-c:a", "aac", "-b:a", "192k", combined_out]
            ok, err = run_ffmpeg(concat_cmd_reencode, "intro/outro re-encode concat")
            if not ok:
                ok, _ = run_ffmpeg(nvenc_to_sw_fallback(concat_cmd_reencode), "intro/outro SW fallback")

        for p in [intro_path, outro_path, xfade_out, concat_list_file]:
            if p:
                try: os.remove(p)
                except: pass

        if not ok:
            return False, "", "Intro/Outro concat failed."

        body_with_intro_outro = combined_out

    # ── Phase 3 + 4 ──────────────────────────────────────────────────────────
    final_path = str(Path(OUTPUT_DIR) / f"FarmVideo_{quality_tag}_{timestamp}.mp4")

    if voiceover_path:
        # Voiceover আছে → EQ/Gate/Loudnorm process করে L-Cut mix (+ ঐচ্ছিক bg music)
        st.info("🎙️ Voiceover process হচ্ছে (১৮টা অডিও ফিচার প্রয়োগ হচ্ছে)...")
        vo_proc = unique_tmp("vo_processed", "m4a")
        if not process_voiceover(voiceover_path, vo_proc, audio_settings):
            return False, "", "Voiceover processing failed."

        st.info("✂️ L-Cut audio mix হচ্ছে...")
        # Fade-out এর জন্য total video duration জানা দরকার (কোথা থেকে fade
        # শুরু হবে তা বের করতে)। Fade না চাইলে এই probe এর দরকার নেই কিন্তু
        # খরচ কম বলে সবসময় করে রাখা নিরাপদ।
        total_dur = probe_duration(body_with_intro_outro)
        ok = apply_lcut_voiceover_mix(
            video_path=body_with_intro_outro, voiceover_path=vo_proc,
            output_path=final_path, profile=profile,
            audio_settings=audio_settings,
            bg_music_path=bg_music_path,
            bg_music_volume=bg_music_volume,
            total_duration=total_dur,
            fade_in_sec=(st.session_state.get("audio_fade_in_sec", 0.0)
                        if st.session_state.get("audio_fade_in_enable") else 0.0),
            fade_out_sec=(st.session_state.get("audio_fade_out_sec", 0.0)
                         if st.session_state.get("audio_fade_out_enable") else 0.0),
            is_preview=is_preview,
        )
        for p in [body_with_intro_outro, vo_proc]:
            try: os.remove(p)
            except: pass
        if not ok:
            return False, "", "L-Cut mix failed."

    elif bg_music_path:
        # Voiceover নেই কিন্তু background music আছে → শুধু music মিক্স করি
        st.info("🎵 Background music mix হচ্ছে...")
        audio_bitrate = "320k" if audio_settings.get("vo_aac_320") else "192k"

        fade_in_on  = st.session_state.get("audio_fade_in_enable", False)
        fade_out_on = st.session_state.get("audio_fade_out_enable", False)
        fade_parts = []
        if fade_in_on:
            fin = st.session_state.get("audio_fade_in_sec", 1.5)
            fade_parts.append(f"afade=t=in:st=0:d={fin:.2f}")
        if fade_out_on:
            total_dur = probe_duration(body_with_intro_outro)
            fout = st.session_state.get("audio_fade_out_sec", 2.0)
            if total_dur > fout:
                fade_parts.append(f"afade=t=out:st={total_dur - fout:.2f}:d={fout:.2f}")
        fade_chain = "," + ",".join(fade_parts) if fade_parts else ""

        cmd = [
            FFMPEG_BIN, "-y",
            "-i", body_with_intro_outro,
            "-stream_loop", "-1", "-i", bg_music_path,
            "-filter_complex",
            f"[0:a]volume=0.7[va];[1:a]volume={bg_music_volume:.2f}[bgm];"
            f"[va][bgm]amix=inputs=2:duration=first:dropout_transition=2[amixed];"
            f"[amixed]anull{fade_chain}[aout]",
            "-map", "0:v", "-map", "[aout]",
            "-c:v", "copy",
            "-c:a", "aac", "-b:a", audio_bitrate, "-ar", "48000",
            final_path,
        ]
        ok, err = run_ffmpeg(cmd, "BG music only mix")
        try: os.remove(body_with_intro_outro)
        except: pass
        if not ok:
            return False, "", "Background music mix failed."

    else:
        # না voiceover, না bg music — clip audio এর উপর সরাসরি fade
        # প্রয়োগ করা যাবে যদি ব্যবহারকারী fade চান, নাহলে সরাসরি move করি।
        fade_in_on  = st.session_state.get("audio_fade_in_enable", False)
        fade_out_on = st.session_state.get("audio_fade_out_enable", False)
        if fade_in_on or fade_out_on:
            fade_parts = []
            if fade_in_on:
                fin = st.session_state.get("audio_fade_in_sec", 1.5)
                fade_parts.append(f"afade=t=in:st=0:d={fin:.2f}")
            if fade_out_on:
                total_dur = probe_duration(body_with_intro_outro)
                fout = st.session_state.get("audio_fade_out_sec", 2.0)
                if total_dur > fout:
                    fade_parts.append(f"afade=t=out:st={total_dur - fout:.2f}:d={fout:.2f}")
            if fade_parts:
                af_chain = ",".join(fade_parts)
                cmd = [
                    FFMPEG_BIN, "-y",
                    "-i", body_with_intro_outro,
                    "-c:v", "copy",
                    "-af", af_chain,
                    "-c:a", "aac", "-b:a", "192k",
                    final_path,
                ]
                ok, err = run_ffmpeg(cmd, "Fade in/out only (no voiceover/bgm)")
                try: os.remove(body_with_intro_outro)
                except: pass
                if not ok:
                    return False, "", "Fade in/out apply failed."
            else:
                shutil.move(body_with_intro_outro, final_path)
        else:
            shutil.move(body_with_intro_outro, final_path)

    # ── Phase 5 — SRT সাবটাইটেল Export (ঐচ্ছিক) ────────────────────────────
    # ক্লিপে দেওয়া caption টেক্সট থেকেই .srt বানানো হয় — আলাদাভাবে টাইপ
    # করতে হয় না। Intro duration যোগ করা হয় যাতে timeline shift ঠিক থাকে।
    if st.session_state.get("srt_export_enable") and not is_preview:
        try:
            srt_content = generate_srt_from_clips(clips, intro_duration=intro_duration_used)
            st.session_state["srt_last_content"] = srt_content
            if srt_content:
                srt_path = str(Path(OUTPUT_DIR) / f"FarmVideo_{quality_tag}_{timestamp}.srt")
                with open(srt_path, "w", encoding="utf-8") as f:
                    f.write(srt_content)
                st.session_state["srt_last_path"] = srt_path
        except Exception as e:
            log.warning(f"SRT generation failed (non-fatal): {e}")

    # ── Phase 5.5 — YouTube Chapter List Export (ঐচ্ছিক) ───────────────────
    # ক্যাপশন থেকে chapter timestamp বানায় — video description এ পেস্ট
    # করার জন্য .txt ফাইল হিসেবে সংরক্ষণ হয়। .srt এর মতো এটাও non-fatal:
    # ব্যর্থ হলে পুরো render আটকাবে না।
    if st.session_state.get("chapter_export_enable") and not is_preview:
        try:
            chapter_content = generate_youtube_chapters_from_clips(
                clips, intro_duration=intro_duration_used
            )
            st.session_state["chapter_last_content"] = chapter_content
            if chapter_content:
                chapter_path = str(Path(OUTPUT_DIR) / f"FarmVideo_{quality_tag}_{timestamp}_chapters.txt")
                with open(chapter_path, "w", encoding="utf-8") as f:
                    f.write(chapter_content)
                st.session_state["chapter_last_path"] = chapter_path
        except Exception as e:
            log.warning(f"Chapter generation failed (non-fatal): {e}")

    return True, final_path, ""


# ─────────────────────────────────────────────────────────────────────────────
# ░░░  STREAMLIT UI  ░░░
# ─────────────────────────────────────────────────────────────────────────────

def render_ui() -> None:

    st.set_page_config(
        page_title="🌾 Shadhinata Farm Video Tool",
        page_icon="🌾",
        layout="wide",
        initial_sidebar_state="expanded",
    )

    st.markdown("""
    <style>
    :root {
        --shd-bg:         #0d1210;
        --shd-panel:      #161d16;
        --shd-panel-alt:  #1c261c;
        --shd-border:     #2a3a2a;
        --shd-text:       #eef2ee;
        --shd-text-dim:   #9fb0a0;
        --shd-green:      #1b5e20;
        --shd-green-light:#2e7d32;
        --shd-gold:       #d9a441;
    }

    /* ── বেস টেক্সট রিসেট — dark theme এ কোনো টেক্সট চোখে না পড়ার আসল ফিক্স ──
       Streamlit এর প্রতিটা native widget (selectbox/radio/toggle/slider/
       input) নিজস্ব ভেতরের রঙ ব্যবহার করে, যেটা আমাদের কাস্টম dark
       background এর সাথে contrast miss করছিল। এখানে পুরো app এর ভেতরে
       ডিফল্ট টেক্সট রঙ একটা readable হালকা শেডে সেট করে দিচ্ছি, তারপর
       নিচে badge/heading এর মতো নির্দিষ্ট জায়গায় আলাদা রঙ override হচ্ছে। */
    .stApp, .stApp * { color: var(--shd-text); }
    .stApp { background-color: var(--shd-bg); }

    /* Selectbox/Multiselect dropdown এর option list — এটা .stApp এর বাইরে,
       document body তে আলাদা portal হিসেবে রেন্ডার হয়, তাই আলাদা global
       selector লাগে, নাহলে dropdown খুললে ভেতরের অপশন টেক্সট দেখা যেত না। */
    [data-baseweb="popover"], [data-baseweb="popover"] *,
    [data-baseweb="menu"],    [data-baseweb="menu"] *,
    ul[role="listbox"],       ul[role="listbox"] * {
        background-color: var(--shd-panel) !important;
        color: var(--shd-text) !important;
    }
    [data-baseweb="popover"] li:hover,
    ul[role="listbox"] li:hover { background-color: var(--shd-panel-alt) !important; }

    /* সব widget এর লেবেল (selectbox/slider/radio/toggle/input শিরোনাম) */
    [data-testid="stWidgetLabel"] p { color: var(--shd-text) !important; font-weight: 500; }

    /* Text/Number input বক্স */
    .stTextInput input, .stTextArea textarea, .stNumberInput input {
        color: var(--shd-text) !important;
        background-color: var(--shd-panel-alt) !important;
        border: 1px solid var(--shd-border) !important;
        border-radius: 6px !important;
    }
    .stTextInput input::placeholder,
    .stTextArea textarea::placeholder,
    .stNumberInput input::placeholder {
        color: var(--shd-text-dim) !important;
        opacity: 1 !important;
    }

    /* Selectbox নিজের বক্স */
    [data-baseweb="select"] > div {
        background-color: var(--shd-panel-alt) !important;
        border-color: var(--shd-border) !important;
        color: var(--shd-text) !important;
    }

    /* Slider এর সংখ্যা bubble ও tick label */
    [data-testid="stThumbValue"] { color: var(--shd-gold) !important; font-weight: 700; }
    [data-testid="stTickBar"] p  { color: var(--shd-text-dim) !important; }

    /* Radio/Checkbox লেবেল */
    [data-testid="stRadio"] label p,
    [data-testid="stCheckbox"] label p { color: var(--shd-text) !important; }

    /* Toggle — চালু থাকলে gold accent */
    [data-testid="stToggle"] div[role="switch"][aria-checked="true"] {
        background-color: var(--shd-gold) !important;
    }

    /* Info/Success/Warning/Error বক্সের ভেতরের টেক্সট */
    [data-testid="stAlert"] p, [data-testid="stAlert"] span { color: var(--shd-text) !important; }

    /* পাইপলাইন সারসংক্ষেপ টেবিলের টেক্সট/বর্ডার */
    [data-testid="stMarkdownContainer"] table,
    [data-testid="stMarkdownContainer"] th,
    [data-testid="stMarkdownContainer"] td { color: var(--shd-text) !important; border-color: var(--shd-border) !important; }

    /* File uploader dropzone — কার্ডের মতো */
    [data-testid="stFileUploaderDropzone"] {
        background-color: var(--shd-panel-alt) !important;
        border: 1px dashed var(--shd-border) !important;
        border-radius: 10px;
    }

    /* Caption — মূল টেক্সট থেকে একটু dim, কিন্তু readable */
    [data-testid="stCaptionContainer"],
    [data-testid="stCaptionContainer"] *,
    .stCaption, .stCaption *, small {
        color: var(--shd-text-dim) !important;
        opacity: 1 !important;
    }

    .clip-row {
        background: var(--shd-panel-alt); border-left: 3px solid var(--shd-green-light);
        padding: 0.5rem 1rem; margin: 0.2rem 0;
        border-radius: 0 8px 8px 0; font-size: 0.85rem;
    }
    .badge-nvenc { background:#1b5e20; color:#a5d6a7 !important; padding:2px 10px; border-radius:12px; font-size:0.78rem; }
    .badge-sw    { background:#4a2c00; color:#ffcc80 !important; padding:2px 10px; border-radius:12px; font-size:0.78rem; }
    .badge-err   { background:#5c0011; color:#ffcdd2 !important; padding:2px 10px; border-radius:12px; font-size:0.78rem; }

    #MainMenu {visibility:hidden;} footer {visibility:hidden;}
    [data-testid="stToolbar"] { visibility: hidden !important; }
    [data-testid="stDecoration"] { display: none !important; }

    /* Sidebar — CapCut এর left panel এর মতো একটু গাঢ় শেড */
    [data-testid="stSidebar"] {
        background-color: var(--shd-panel);
        border-right: 1px solid var(--shd-border);
    }
    [data-testid="stSidebar"] h3, [data-testid="stSidebar"] h4 {
        color: var(--shd-gold) !important;
        font-weight: 700;
    }

    /* Headings */
    h1, h2, h3 { color: var(--shd-text) !important; }
    hr { border-color: var(--shd-border) !important; }

    /* Expander → CapCut এর মতো card panel */
    [data-testid="stExpander"] {
        background: var(--shd-panel);
        border: 1px solid var(--shd-border);
        border-radius: 10px;
        overflow: hidden;
        margin-bottom: 0.5rem;
    }
    [data-testid="stExpander"] summary {
        font-weight: 600;
        color: var(--shd-text) !important;
    }
    [data-testid="stExpander"] summary:hover { background-color: var(--shd-panel-alt); }

    /* Tabs (যদি ভবিষ্যতে ব্যবহার হয়) — CapCut এর pill tab এর মতো */
    [data-testid="stTabs"] button { color: var(--shd-text-dim) !important; border-radius: 6px 6px 0 0; }
    [data-testid="stTabs"] button[aria-selected="true"] {
        color: var(--shd-gold) !important;
        border-bottom: 2px solid var(--shd-gold) !important;
    }

    /* Buttons */
    .stButton button {
        border-radius: 8px;
        border: 1px solid var(--shd-green-light);
        color: var(--shd-text) !important;
        background-color: var(--shd-panel-alt);
        transition: all 0.15s ease;
    }
    .stButton button p { color: inherit !important; }
    .stButton button:hover {
        border-color: var(--shd-gold);
        color: var(--shd-gold) !important;
    }
    .stButton button[kind="primary"] {
        background: linear-gradient(135deg, var(--shd-green), var(--shd-green-light));
        border: none;
        font-weight: 700;
        color: #ffffff !important;
    }
    .stButton button[kind="primary"]:hover {
        background: linear-gradient(135deg, var(--shd-green-light), var(--shd-gold));
    }

    /* Progress bar */
    .stProgress > div > div { background-color: var(--shd-gold) !important; }
    </style>
    """, unsafe_allow_html=True)

    # ── Header ────────────────────────────────────────────────────────────────
    c1, c2 = st.columns([4, 1])
    with c1:
        st.markdown(
            "<h2 style='margin-bottom:0;color:#e8f5e9;'>"
            "🌾 <span style='color:#d9a441;'>Shadhinata Farm</span> Video Automation Tool "
            "<span style='font-size:0.6em;color:#7a8a7a;'>v2.0</span></h2>",
            unsafe_allow_html=True,
        )
        st.caption("Offline · FFmpeg NVENC · Bangla Unicode · 60FPS · Pro Audio")
    with c2:
        if st.session_state["nvenc_available"] is None:
            st.session_state["nvenc_available"] = check_nvenc_available() if check_ffmpeg_available() else False
        if st.session_state["vidstab_available"] is None:
            st.session_state["vidstab_available"] = check_vidstab_available() if check_ffmpeg_available() else False

        if not check_ffmpeg_available():
            st.markdown('<span class="badge-err">❌ FFmpeg নেই</span>', unsafe_allow_html=True)
        elif st.session_state["nvenc_available"]:
            st.markdown('<span class="badge-nvenc">✅ NVENC চালু</span>', unsafe_allow_html=True)
        else:
            st.markdown('<span class="badge-sw">⚠️ CPU মোড</span>', unsafe_allow_html=True)

        if check_ffmpeg_available():
            if st.session_state["vidstab_available"]:
                st.markdown('<span class="badge-nvenc">✅ Stabilizer (Strong+Light) রেডি</span>', unsafe_allow_html=True)
            else:
                st.markdown('<span class="badge-sw">⚠️ শুধু Light Stabilizer</span>', unsafe_allow_html=True)
    st.divider()

    # ═══════════════════════════════════════════════════════════════════════════
    # SIDEBAR
    # ═══════════════════════════════════════════════════════════════════════════
    with st.sidebar:

        # ── বাংলা ফন্ট নির্বাচন ────────────────────────────────────────────────
        st.markdown("### 🔤 বাংলা ফন্ট")
        font_choice = st.selectbox(
            "Caption ও Watermark এর জন্য ফন্ট বাছুন",
            options=list(BANGLA_FONTS.keys()),
            index=list(BANGLA_FONTS.keys()).index(st.session_state["selected_bangla_font"]),
            help="দুটো ফন্টই ব্যবহার করা যাবে। fonts\\ ফোল্ডারে দুটো .ttf ফাইলই রাখতে হবে।"
        )
        st.session_state["selected_bangla_font"] = font_choice

        # ফন্ট ফাইল আসলে আছে কিনা চেক করে দেখানো
        _selected_path = BANGLA_FONTS[font_choice]
        if os.path.exists(_selected_path):
            st.caption(f"✅ পাওয়া গেছে: `{os.path.basename(_selected_path)}`")
        else:
            st.warning(
                f"⚠️ ফন্ট ফাইল পাওয়া যাচ্ছে না!\\n\\n"
                f"`fonts\\\\{os.path.basename(_selected_path)}` রাখতে হবে।"
            )

        st.divider()

        # ── Render Settings ───────────────────────────────────────────────────
        st.markdown("### ⚙️ রেন্ডার সেটিংস")

        batch_mode = st.toggle(
            "📦 Batch Export (একসাথে একাধিক ফরম্যাট)",
            value=st.session_state.get("batch_export_enable", False),
            help=(
                "একবার render করলেই YouTube (16:9) ও Facebook Reels/Shorts (9:16) "
                "দুটোই একসাথে তৈরি হয়ে যাবে — আলাদা করে দুইবার করা লাগবে না।"
            )
        )
        st.session_state["batch_export_enable"] = batch_mode

        if batch_mode:
            st.caption("যেসব ফরম্যাটে output চান, বেছে নিন:")
            batch_selected = st.multiselect(
                "Batch Export ফরম্যাট",
                options=list(PROFILES.keys()),
                default=st.session_state.get("batch_profiles_selected", list(PROFILES.keys())[:2]),
                label_visibility="collapsed",
            )
            st.session_state["batch_profiles_selected"] = batch_selected
            if batch_selected:
                st.info(f"✅ {len(batch_selected)}টা ফরম্যাটে একসাথে render হবে — সময় বেশি লাগবে।")
            profile_name = batch_selected[0] if batch_selected else list(PROFILES.keys())[0]
            profile = PROFILES[profile_name]
        else:
            profile_name = st.selectbox("রেজোলিউশন ও Aspect Ratio", list(PROFILES.keys()))
            profile = PROFILES[profile_name]

        st.caption(f"`{profile['w']}×{profile['h']}` · `{profile['bitrate']}` · `{TARGET_FPS}fps`")
        if profile["crop_mode"] == "center_crop":
            st.info("📱 9:16 মোড: Center-crop চালু — মাঝের অংশ রাখবে।")

        st.divider()

        # ── Transition Selector ───────────────────────────────────────────────
        st.markdown("### 🎞️ ট্রানজিশন টাইপ")
        transition_label = st.selectbox(
            "ক্লিপের মাঝে ট্রানজিশন",
            options=list(TRANSITION_OPTIONS.keys()),
            index=0,
            help="প্রতিটা ক্লিপের মাঝে এই ট্রানজিশন ব্যবহার হবে।"
        )
        transition_type = TRANSITION_OPTIONS[transition_label]
        st.session_state["transition_type"] = transition_type
        st.caption({
            "fade":      "ধীরে ধীরে একটা থেকে আরেকটায় যায়",
            "hblur":     "মোশন ব্লার দিয়ে ঝাপসা হয়ে পরের ক্লিপ আসে",
            "slideleft": "বাম দিক থেকে পরের ক্লিপ স্লাইড করে আসে",
            "radial":    "গোলাকারভাবে ঘুরে পরের ক্লিপ আসে",
            "wiperight": "ডান দিক থেকে ওয়াইপ হয়ে পরের ক্লিপ আসে",
        }.get(transition_type, ""))

        st.divider()

        # ── Smooth Transition Enhancements (৪টা প্রো ফিচার) ────────────────────
        st.markdown("### ✨ স্মুথ ট্রানজিশন")
        st.caption("দুইটা ক্লিপের মাঝের কাট যেন চোখে/কানে না লাগে")

        st.session_state["transition_adaptive_duration"] = st.toggle(
            "১. 📏 Adaptive Duration (ক্লিপ অনুযায়ী auto adjust)",
            value=st.session_state["transition_adaptive_duration"],
            help=(
                "ছোট ক্লিপে (২-৩ সেকেন্ড) transition auto ছোট হবে, লম্বা "
                "ক্লিপে একটু বড় — নাহলে ছোট ক্লিপে fixed ০.৩s transition "
                "অনেকটা সময় 'খেয়ে' নিতে পারে।"
            )
        )

        curve_label = st.selectbox(
            "২. 🎚️ Audio Crossfade Curve",
            options=["Triangular (স্বাভাবিক)", "Smooth Sine (মসৃণ)", "Exponential"],
            index=0,
            help="Audio crossfade কীভাবে ভলিউম পরিবর্তন করবে — বিভিন্ন curve বিভিন্ন 'অনুভূতি' দেয়।"
        )
        curve_map = {
            "Triangular (স্বাভাবিক)": "tri",
            "Smooth Sine (মসৃণ)":     "qsin",
            "Exponential":            "exp",
        }
        st.session_state["transition_audio_curve"] = curve_map[curve_label]

        st.session_state["transition_auto_level_match"] = st.toggle(
            "৩. 🎚️ Auto-Level Matching (volume ফারাক auto সমান)",
            value=st.session_state["transition_auto_level_match"],
            help=(
                "একটা ক্লিপ জোরে, পরেরটা আস্তে রেকর্ড হলে transition এ কানে "
                "'ধাক্কা' লাগে। এটা চালু থাকলে বড় ফারাক (>3 LUFS) থাকলে "
                "স্বয়ংক্রিয়ভাবে হালকা সমন্বয় করে (সর্বোচ্চ ±3dB, বিকৃতি এড়াতে)।"
            )
        )

        st.session_state["transition_whoosh_enable"] = st.toggle(
            "৪. 🌬️ Transition Whoosh SFX (ঐচ্ছিক)",
            value=st.session_state["transition_whoosh_enable"],
            help=(
                "প্রতিটা কাট পয়েন্টে একটা হালকা 'হুশ' শব্দ effect মিশিয়ে দেয় — "
                "visual transition এর সাথে sync করে, cinematic অনুভূতি বাড়ায়।"
            )
        )
        if st.session_state["transition_whoosh_enable"]:
            whoosh_upload = st.file_uploader(
                "Whoosh SFX ফাইল (WAV/MP3)",
                type=["wav", "mp3"],
                key="whoosh_uploader",
                help="ছোট (০.৩-০.৫ সেকেন্ড) whoosh/swoosh sound effect upload করুন।"
            )
            if whoosh_upload:
                ensure_dirs()
                st.session_state["transition_whoosh_path"] = save_uploaded_file(whoosh_upload, TEMP_DIR)
                st.success(f"✅ {whoosh_upload.name} লোড হয়েছে")

            if st.session_state.get("transition_whoosh_path"):
                st.session_state["transition_whoosh_volume"] = st.slider(
                    "Whoosh Volume",
                    min_value=0.1, max_value=1.0,
                    value=float(st.session_state["transition_whoosh_volume"]),
                    step=0.05,
                )
            else:
                st.caption("⚠️ Whoosh SFX ফাইল upload না করলে এই ফিচার কাজ করবে না।")

        st.divider()

        # ── Color Grading ────────────────────────────────────────────────────
        st.markdown("### 🎨 কালার গ্রেডিং")
        color_label = st.selectbox(
            "প্রিসেট বাছুন (সব ক্লিপে প্রয়োগ হবে)",
            options=list(COLOR_GRADE_PRESETS.keys()),
            index=0,
            help="খামার/প্রকৃতির ভিডিওর জন্য প্রস্তুত করা color look — একটাই সব ক্লিপে বসবে।"
        )
        st.session_state["color_grade_preset"] = COLOR_GRADE_PRESETS[color_label]
        st.caption({
            "none":           "কোনো পরিবর্তন হবে না — মূল রঙ থাকবে",
            "warm_farm":      "হালকা উষ্ণ কমলা/হলুদ টোন — মাঠ/ফসলের জন্য স্বাভাবিক ও আরামদায়ক",
            "golden_hour":    "শক্তিশালী সোনালি টোন — সূর্যাস্তের মতো নাটকীয় অনুভূতি",
            "vivid_green":    "সবুজ রঙ আরও গাঢ় ও প্রাণবন্ত — ফসল/গাছপালার ভিডিওতে ভালো লাগে",
            "soft_cinematic": "কম saturation, নরম contrast — সিনেমাটিক, শান্ত অনুভূতি",
        }.get(st.session_state["color_grade_preset"], ""))

        st.divider()

        # ── Global Speed ──────────────────────────────────────────────────────
        st.markdown("### ⏩ ডিফল্ট ক্লিপ স্পিড")
        global_speed = st.slider(
            "সব ক্লিপের স্পিড (muted ক্লিপে)",
            min_value=1.1, max_value=2.0, value=DEFAULT_SPEED, step=0.1,
            help="1.1 = সামান্য দ্রুত, 1.5 = মাঝারি, 2.0 = দ্বিগুণ দ্রুত"
        )
        st.session_state["global_speed"] = global_speed
        st.caption(f"বর্তমান: **{global_speed}×** গতি")

        st.divider()

        # ── Global Stabilization ─────────────────────────────────────────────
        st.markdown("### 📹 ডিফল্ট Stabilization (কাঁপুনি কমানো)")
        global_stab_enable = st.toggle(
            "সব নতুন ক্লিপে auto stabilize চালু করুন",
            value=st.session_state["global_stabilize_enable"],
            help="Speed এর মতোই — চালু রাখলে নতুন আপলোড করা প্রতিটা ক্লিপে auto stabilization বসে যাবে",
        )
        st.session_state["global_stabilize_enable"] = global_stab_enable

        if global_stab_enable:
            global_stab_mode = st.radio(
                "মোড",
                options=["light", "strong"],
                index=["light", "strong"].index(st.session_state["global_stabilize_mode"]),
                horizontal=True,
                help="Light = দ্রুত, single-pass। Strong = দুই-পাস vidstab, শক্তিশালী কিন্তু অনেক ধীর।",
            )
            st.session_state["global_stabilize_mode"] = global_stab_mode
            st.caption(
                "⚠️ Strong মোড প্রতিটা ক্লিপে ২-পাস প্রসেসিং করে — সব ক্লিপে auto চালু রাখলে "
                "রেন্ডার অনেক ধীর হবে। বেশি ক্লিপ থাকলে Light রাখাই ভালো, শুধু বেশি কাঁপা ক্লিপে "
                "ম্যানুয়ালি Strong করে দিন।"
            )

        st.divider()

        # ── Master Mute ───────────────────────────────────────────────────────
        st.markdown("### 🔇 মাস্টার অডিও")
        mute_all = st.toggle(
            "সব ক্লিপ Mute করো",
            value=True,
            help="চালু থাকলে সব ক্লিপ muted থাকবে। নিচে আলাদা ক্লিপ unmute করতে পারবেন।"
        )

        st.divider()

        # ── Background Music (Voiceover থেকে আলাদা) ─────────────────────────
        st.markdown("### 🎵 ব্যাকগ্রাউন্ড মিউজিক")
        st.session_state["bg_music_enable"] = st.toggle(
            "ব্যাকগ্রাউন্ড মিউজিক চালু করো",
            value=st.session_state["bg_music_enable"],
            help=(
                "Voiceover ছাড়াও একটা আলাদা মিউজিক ট্র্যাক যোগ করতে পারবেন। "
                "এটা সম্পূর্ণ ভিডিও জুড়ে খুব কম volume এ loop হয়ে বাজবে।"
            )
        )
        if st.session_state["bg_music_enable"]:
            st.session_state["bg_music_volume"] = st.slider(
                "মিউজিক Volume",
                min_value=0.02, max_value=0.40,
                value=float(st.session_state["bg_music_volume"]),
                step=0.02,
                help="Voiceover ও ambient sound এর নিচে থাকবে। কম রাখাই ভালো (8-15%)।"
            )
            st.caption(f"বর্তমান: **{int(st.session_state['bg_music_volume']*100)}%**")

        st.divider()

        # ── Audio Fade In/Out (পুরো মিক্সড audio এর উপর) ──────────────────────
        st.markdown("### 🔉 Audio Fade In/Out")
        st.caption("ভিডিওর শুরু/শেষে audio আস্তে আস্তে শুরু/মিলিয়ে যাবে — পুরো mixed audio এর উপর প্রয়োগ হয়")

        fio_col1, fio_col2 = st.columns(2)
        with fio_col1:
            st.session_state["audio_fade_in_enable"] = st.toggle(
                "Fade In (শুরুতে)",
                value=st.session_state["audio_fade_in_enable"],
            )
            if st.session_state["audio_fade_in_enable"]:
                st.session_state["audio_fade_in_sec"] = st.slider(
                    "Fade In দৈর্ঘ্য (সেকেন্ড)",
                    min_value=0.5, max_value=5.0,
                    value=float(st.session_state["audio_fade_in_sec"]),
                    step=0.5,
                    key="fade_in_slider",
                )
        with fio_col2:
            st.session_state["audio_fade_out_enable"] = st.toggle(
                "Fade Out (শেষে)",
                value=st.session_state["audio_fade_out_enable"],
            )
            if st.session_state["audio_fade_out_enable"]:
                st.session_state["audio_fade_out_sec"] = st.slider(
                    "Fade Out দৈর্ঘ্য (সেকেন্ড)",
                    min_value=0.5, max_value=5.0,
                    value=float(st.session_state["audio_fade_out_sec"]),
                    step=0.5,
                    key="fade_out_slider",
                )

        st.divider()

        # ── Pro Audio Settings ────────────────────────────────────────────────
        st.markdown("### 🤖 AI নয়েজ রিমুভাল (RNNoise)")
        st.caption("সম্পূর্ণ ফ্রি, অফলাইনে চলে — কোনো ইন্টারনেট/API লাগে না")
        _rnnoise_ready = os.path.exists(RNNOISE_MODEL_PATH)
        st.session_state["vo_rnnoise"] = st.toggle(
            "০. 🤖 AI Deep-Learning Denoise (RNNoise)",
            value=st.session_state["vo_rnnoise"],
            disabled=not _rnnoise_ready,
            help=(
                "RNN-ভিত্তিক AI মডেল দিয়ে background noise আলাদা করে — মাঠের "
                "বাতাস/দূরের শব্দে classic filter এর চেয়ে ভালো ফল দেয়। সম্পূর্ণ "
                "অফলাইন, কোনো cost নেই."
                + ("" if _rnnoise_ready else " ⚠️ models/rnnoise/voice.rnnn পাওয়া যায়নি — বন্ধ আছে।")
            )
        )
        st.divider()
        st.markdown("### 🎚️ প্রো অডিও ফিচার")
        st.caption("Voiceover এর জন্য প্রযোজ্য")

        st.session_state["vo_eq_enable"] = st.toggle(
            "১. 🎛️ Vocal EQ — স্টুডিও সাউন্ড",
            value=st.session_state["vo_eq_enable"],
            help="কণ্ঠের মিড ফ্রিকোয়েন্সি boost করে, bass muddy কমায়। স্পষ্ট কণ্ঠের জন্য।"
        )
        st.session_state["vo_loudnorm"] = st.toggle(
            "২. 📊 Loudness Normalizer (EBU R128)",
            value=st.session_state["vo_loudnorm"],
            help="YouTube standard -16 LUFS তে volume সমান করে। কোথাও বেশি বা কম হবে না।"
        )
        if st.session_state["vo_loudnorm"]:
            st.session_state["vo_loudnorm_twopass"] = st.toggle(
                "   ↳ Two-Pass মোড (আরও নিখুঁত, কিন্তু ধীর)",
                value=st.session_state["vo_loudnorm_twopass"],
                help=(
                    "Single-pass loudnorm অনুমান করে normalize করে। Two-pass "
                    "প্রথমে পুরো audio বিশ্লেষণ করে, তারপর সেই তথ্য দিয়ে "
                    "সঠিকভাবে normalize করে — broadcast-standard এর কাছাকাছি "
                    "নিখুঁত ফলাফল দেয়। কিন্তু audio দুইবার process হয় বলে "
                    "সময় বেশি লাগে।"
                )
            )
        st.session_state["vo_limiter"] = st.toggle(
            "২.৫ 🛡️ Peak Limiter (audio ফাটা রোধ)",
            value=st.session_state["vo_limiter"],
            help=(
                "সব processing এর পরও যদি হঠাৎ জোরে শব্দ (গরুর ডাক, হাততালি) "
                "আসে, তা speaker এ 'ফাটা'/clip হওয়া থেকে ১০০% আটকায়। "
                "সবসময় ON রাখা নিরাপদ।"
            )
        )
        if st.session_state["vo_limiter"]:
            st.session_state["vo_limiter_level"] = st.slider(
                "Limiter সিলিং লেভেল",
                min_value=0.85, max_value=0.99,
                value=float(st.session_state["vo_limiter_level"]),
                step=0.01,
                help="কম মান = বেশি নিরাপদ কিন্তু সামান্য কম জোরে শোনাবে। 0.95 সাধারণত ভালো।"
            )
        st.session_state["vo_noise_gate"] = st.toggle(
            "৩. 🔕 Intelligent Noise Gate",
            value=st.session_state["vo_noise_gate"],
            help="নিঃশ্বাসের শব্দ ও mic হিস কাটে। চুপ থাকলে সম্পূর্ণ নীরব।"
        )
        st.session_state["vo_lcut"] = st.toggle(
            "৪. ✂️ L-Cut Audio (মসৃণ কাট)",
            value=st.session_state["vo_lcut"],
            help=f"Voiceover {JCUT_OFFSET}s আগে শুরু হয়। Scene cut এ cinematic feel আসে।"
        )
        st.session_state["vo_pitch_correct"] = st.toggle(
            "৫. 🎵 Pitch-Corrected Speed",
            value=st.session_state["vo_pitch_correct"],
            help="Speed বাড়লেও কণ্ঠের pitch স্বাভাবিক থাকে (atempo filter)।"
        )
        st.session_state["vo_ducking"] = st.toggle(
            "৬. 🦆 Ambient Ducking",
            value=st.session_state["vo_ducking"],
            help="Background clip audio 85% কমিয়ে voiceover কে সামনে রাখে।"
        )
        st.session_state["vo_aac_320"] = st.toggle(
            "৭. 🔊 AAC 320kbps Encoder",
            value=st.session_state["vo_aac_320"],
            help="High-quality audio encode। সর্বোচ্চ AAC কোয়ালিটি।"
        )

        st.divider()
        st.markdown("### 🎙️ ভয়েস ক্লিন-আপ (Studio Polish)")
        st.caption("রেকর্ডিং এর ছোট ছোট খুঁত দূর করে আরও পরিষ্কার শোনায়")

        st.session_state["vo_declicker"] = st.toggle(
            "৯. 🧹 De-clicker (ক্লিক/পপ শব্দ দূর)",
            value=st.session_state["vo_declicker"],
            help=(
                "মাইকে হাত লাগা, প্লোসিভ (প-ফ-ব উচ্চারণে) শব্দ, বা ছোট "
                "'পপ/ক্লিক' জাতীয় শব্দ মসৃণ করে। সাধারণত সবসময় ON রাখাই ভালো।"
            )
        )

        st.session_state["vo_deesser"] = st.toggle(
            "১০. 🔉 De-esser (স/শ এর তীক্ষ্ণতা কমায়)",
            value=st.session_state["vo_deesser"],
            help=(
                "মাইকে 'স', 'শ' জাতীয় শব্দ খুব তীক্ষ্ণ/কর্কশ শোনালে তা "
                "নরম করে। কাছাকাছি মাইকে কথা বললে এটা খুব দরকারি হয়।"
            )
        )
        if st.session_state["vo_deesser"]:
            st.session_state["vo_deesser_amount"] = st.slider(
                "De-esser তীব্রতা",
                min_value=0.1, max_value=1.0,
                value=float(st.session_state["vo_deesser_amount"]),
                step=0.05,
                help="বেশি মান = বেশি নরম করবে 'স' শব্দ। খুব বেশি দিলে অস্বাভাবিক লাগতে পারে।"
            )
            st.caption(f"বর্তমান তীব্রতা: **{int(st.session_state['vo_deesser_amount']*100)}%**")

        st.divider()
        st.markdown("### 🌾 ফিল্ড রেকর্ডিং ক্লিন-আপ")
        st.caption("মাঠে/খোলা জায়গায় রেকর্ডিং এর জন্য বিশেষ ফিচার (AI ছাড়া, pure DSP filter)")

        st.session_state["vo_bandpass"] = st.toggle(
            "১১. 🎚️ Band-pass Filter (কণ্ঠের রেঞ্জের বাইরে সব কাটে)",
            value=st.session_state["vo_bandpass"],
            help="মানুষের কণ্ঠের রেঞ্জের (80Hz–8kHz) বাইরের সব ফ্রিকোয়েন্সি কেটে ফেলে। সবচেয়ে basic কিন্তু শক্তিশালী noise reduction।"
        )

        st.session_state["vo_wind_filter"] = st.toggle(
            "১২. 💨 Wind Noise Filter",
            value=st.session_state["vo_wind_filter"],
            help="বাতাসের নিচু কম্পাঙ্কের 'ভোঁ ভোঁ' শব্দ কাটে। মাঠে রেকর্ড করলে এটা খুব দরকারি।"
        )
        if st.session_state["vo_wind_filter"]:
            st.session_state["vo_wind_cutoff"] = st.slider(
                "Wind Filter Cutoff (Hz)",
                min_value=60.0, max_value=200.0,
                value=float(st.session_state["vo_wind_cutoff"]),
                step=10.0,
                help="এর নিচের ফ্রিকোয়েন্সি কাটবে। বেশি বাতাস থাকলে মান বাড়ান।"
            )

        st.session_state["vo_hum_removal"] = st.toggle(
            "১৩. ⚡ Hum Removal (বৈদ্যুতিক গুনগুন শব্দ)",
            value=st.session_state["vo_hum_removal"],
            help="জেনারেটর/মোটর/বৈদ্যুতিক তারের কারণে হওয়া 50/60Hz 'গুনগুন' শব্দ কাটে। শুধু এই সমস্যা থাকলে ON করুন।"
        )
        if st.session_state["vo_hum_removal"]:
            st.session_state["vo_hum_freq"] = st.selectbox(
                "Hum Frequency",
                options=[50, 60],
                index=[50, 60].index(st.session_state["vo_hum_freq"]),
                help="বাংলাদেশ/ভারতে সাধারণত 50Hz। আমেরিকান যন্ত্রপাতি হলে 60Hz।"
            )
            st.session_state["vo_afftdn"] = st.toggle(
            "🧪 Adaptive Denoise (afftdn) — Extra/Backup",
            value=st.session_state["vo_afftdn"],
            help="RNNoise এর backup — মডেল ফাইল না থাকলে বা extra নয়েজি ফুটেজে ON করুন। "
                 "RNNoise এর সাথে একসাথে ON রাখলে ভয়েস কিছুটা 'রোবটিক' শোনাতে পারে।"
        )
        if st.session_state["vo_afftdn"]:
            st.session_state["vo_afftdn_amount"] = st.slider(
                "Denoise Strength (dB)",
                min_value=5.0, max_value=25.0,
                value=float(st.session_state["vo_afftdn_amount"]),
                step=1.0
            )

        st.divider()
        st.markdown("### ✨ কণ্ঠ পলিশ (Studio Polish)")

        st.session_state["vo_multiband"] = st.toggle(
            "১৪. 🎛️ Multiband Compressor",
            value=st.session_state["vo_multiband"],
            help="Bass/mid/treble আলাদাভাবে নিয়ন্ত্রণ করে — studio-level পূর্ণ ও স্থিতিশীল সাউন্ড দেয়।"
        )

        st.session_state["vo_agc"] = st.toggle(
            "১৫. 📶 Auto Gain Control (AGC)",
            value=st.session_state["vo_agc"],
            help="কথা বলার সময় মাইকের কাছে/দূরে গেলেও volume automatic সমান রাখে। মাঠে হাঁটাহাঁটি করে কথা বললে দরকারি।"
        )

        st.session_state["vo_exciter"] = st.toggle(
            "১৬. ✨ Harmonic Exciter (উষ্ণতা যোগ করে)",
            value=st.session_state["vo_exciter"],
            help="কণ্ঠে সূক্ষ্ম উষ্ণতা ও চকচকে ভাব যোগ করে — রেডিও/পডকাস্ট স্টুডিওর মতো অনুভূতি দেয়।"
        )
        if st.session_state["vo_exciter"]:
            st.session_state["vo_exciter_amount"] = st.slider(
                "Exciter তীব্রতা",
                min_value=0.05, max_value=0.40,
                value=float(st.session_state["vo_exciter_amount"]),
                step=0.05,
                help="কম রাখাই ভালো — বেশি দিলে অস্বাভাবিক/harsh শোনাতে পারে।"
            )

        st.session_state["vo_stereo_widen"] = st.toggle(
            "১৭. 🔊 Stereo Widening",
            value=st.session_state["vo_stereo_widen"],
            help="Mono voiceover কে সামান্য প্রশস্ত করে — আরও 'পূর্ণ' শোনায়। ঐচ্ছিক, subtle effect।"
        )
        if st.session_state["vo_stereo_widen"]:
            st.session_state["vo_widen_amount"] = st.slider(
                "Widening তীব্রতা",
                min_value=1.0, max_value=2.0,
                value=float(st.session_state["vo_widen_amount"]),
                step=0.1,
                help="1.0 = কোনো পরিবর্তন নেই, 2.0 = সর্বোচ্চ প্রশস্ত।"
            )

        st.divider()
        st.markdown("### ✂️ Silence Trimmer")
        st.session_state["vo_silence_trim"] = st.toggle(
            "১৮. 🔇 দীর্ঘ নীরবতা Auto কাটো",
            value=st.session_state["vo_silence_trim"],
            help="Voiceover এর মাঝে দীর্ঘ নীরব অংশ থাকলে automatic কেটে ফেলে। এটা audio এর দৈর্ঘ্য বদলে দেয়, তাই সতর্কতার সাথে ব্যবহার করুন।"
        )
        if st.session_state["vo_silence_trim"]:
            st.session_state["vo_silence_threshold"] = st.slider(
                "নীরবতার Threshold (dB)",
                min_value=-60.0, max_value=-20.0,
                value=float(st.session_state["vo_silence_threshold"]),
                step=1.0,
                help="এর নিচে হলে 'নীরব' ধরা হবে। কম (আরও নেগেটিভ) মান = কম sensitive।"
            )
            st.session_state["vo_silence_min_dur"] = st.slider(
                "সর্বনিম্ন নীরবতার দৈর্ঘ্য (সেকেন্ড)",
                min_value=0.3, max_value=3.0,
                value=float(st.session_state["vo_silence_min_dur"]),
                step=0.1,
                help="এর চেয়ে বেশি সময় নীরব থাকলে তবেই কাটা হবে।"
            )
            st.warning("⚠️ এই ফিচার voiceover এর দৈর্ঘ্য কমিয়ে দিতে পারে — video এর সাথে sync ঠিক আছে কিনা preview এ যাচাই করুন।")

        st.divider()
        st.markdown("### 🎤 Echo / Reverb")
        st.caption("কবিতা আবৃত্তি ও নাটকীয় voiceover এর জন্য")

        st.session_state["vo_echo"] = st.toggle(
            "৮. 🔁 Echo / Hall Reverb",
            value=st.session_state["vo_echo"],
            help=(
                "কণ্ঠে প্রতিধ্বনি যোগ করে। কবিতা আবৃত্তি বা "
                "নাটকীয় narration এ স্টেজ অনুভূতি দেয়। "
                "সাধারণ voiceover এ OFF রাখুন।"
            )
        )

        if st.session_state["vo_echo"]:
            st.session_state["vo_echo_delay"] = st.slider(
                "Echo Delay (ms) — প্রতিধ্বনির বিলম্ব",
                min_value=20.0,
                max_value=300.0,
                value=float(st.session_state["vo_echo_delay"]),
                step=5.0,
                help=(
                    "20–50ms = সামান্য room effect\n"
                    "60–100ms = ছোট হল/মঞ্চ\n"
                    "150–300ms = বড় হল বা গির্জা"
                )
            )
            st.session_state["vo_echo_decay"] = st.slider(
                "Echo তীব্রতা (Decay)",
                min_value=0.1,
                max_value=0.9,
                value=float(st.session_state["vo_echo_decay"]),
                step=0.05,
                help=(
                    "0.1–0.3 = হালকা echo (subtle)\n"
                    "0.4–0.6 = মাঝারি (কবিতা আবৃত্তি)\n"
                    "0.7–0.9 = গভীর echo (নাটকীয়)"
                )
            )
            # Live preview of the settings
            d  = st.session_state["vo_echo_delay"]
            dc = st.session_state["vo_echo_decay"]
            st.caption(
                f"⚙️ FFmpeg: `aecho=0.8:0.9:{d}|{round(d*1.6,1)}:{dc}|{round(dc*0.5,2)}`"
            )
            st.info(
                f"🎤 কণ্ঠের পর **{d:.0f}ms** তে প্রথম echo, "
                f"**{round(d*1.6):.0f}ms** তে দ্বিতীয় echo (তীব্রতা {round(dc*0.5,2)})।"
            )

        st.divider()

        # ── Intro / Outro Branding Card ─────────────────────────────────────
        st.markdown("### 🎬 Intro / Outro")
        st.caption("প্রতিটা ভিডিওর শুরু/শেষে একই ব্র্যান্ডিং কার্ড — channel identity তৈরি করে")

        st.session_state["intro_enable"] = st.toggle(
            "Intro card যোগ করো (ভিডিওর শুরুতে)",
            value=st.session_state["intro_enable"],
            help="ভিডিও শুরুর আগে একটা static card দেখাবে — লোগো + টেক্সট সহ।"
        )
        if st.session_state["intro_enable"]:
            st.session_state["intro_text1"] = st.text_input(
                "Intro প্রধান টেক্সট",
                value=st.session_state["intro_text1"],
                key="intro_t1",
                placeholder="যেমন: শাধীনতা ফার্ম",
            )
            st.session_state["intro_text2"] = st.text_input(
                "Intro উপ-টেক্সট (ঐচ্ছিক)",
                value=st.session_state["intro_text2"],
                key="intro_t2",
                placeholder="যেমন: farmerkamol.com",
            )
            st.session_state["intro_duration"] = st.slider(
                "Intro দৈর্ঘ্য (সেকেন্ড)",
                min_value=1.0, max_value=8.0,
                value=float(st.session_state["intro_duration"]),
                step=0.5,
            )
            st.session_state["intro_bg_color"] = st.selectbox(
                "Intro Background রঙ",
                options=["black", "0x1a3d1a", "0x2e5c2e", "0x3d2817"],
                index=0,
                format_func=lambda x: {
                    "black":     "কালো (Classic)",
                    "0x1a3d1a":  "গাঢ় সবুজ (Farm Green)",
                    "0x2e5c2e":  "মাঝারি সবুজ",
                    "0x3d2817":  "মাটি রঙ (Earth Brown)",
                }.get(x, x),
                key="intro_bg_select",
            )

        st.session_state["outro_enable"] = st.toggle(
            "Outro card যোগ করো (ভিডিওর শেষে)",
            value=st.session_state["outro_enable"],
            help="ভিডিও শেষে একটা static card দেখাবে — ধন্যবাদ/subscribe বার্তা সহ।"
        )
        if st.session_state["outro_enable"]:
            st.session_state["outro_text1"] = st.text_input(
                "Outro প্রধান টেক্সট",
                value=st.session_state["outro_text1"],
                key="outro_t1",
                placeholder="যেমন: ধন্যবাদ দেখার জন্য",
            )
            st.session_state["outro_text2"] = st.text_input(
                "Outro উপ-টেক্সট (ঐচ্ছিক)",
                value=st.session_state["outro_text2"],
                key="outro_t2",
                placeholder="যেমন: Subscribe করতে ভুলবেন না",
            )
            st.session_state["outro_duration"] = st.slider(
                "Outro দৈর্ঘ্য (সেকেন্ড)",
                min_value=1.0, max_value=8.0,
                value=float(st.session_state["outro_duration"]),
                step=0.5,
            )
            st.session_state["outro_bg_color"] = st.selectbox(
                "Outro Background রঙ",
                options=["black", "0x1a3d1a", "0x2e5c2e", "0x3d2817"],
                index=0,
                format_func=lambda x: {
                    "black":     "কালো (Classic)",
                    "0x1a3d1a":  "গাঢ় সবুজ (Farm Green)",
                    "0x2e5c2e":  "মাঝারি সবুজ",
                    "0x3d2817":  "মাটি রঙ (Earth Brown)",
                }.get(x, x),
                key="outro_bg_select",
            )

            # ── Social Media Icons (শুধু Outro card এ) ──────────────────────
            st.markdown("###### 📱 Social Media Icons (ঐচ্ছিক)")
            st.caption(
                "PNG ফাইল upload করুন (transparent background সহ ভালো দেখাবে)। "
                "যেগুলো upload করবেন না, সেগুলো card এ দেখাবে না। YouTube/Facebook "
                "এর অফিসিয়াল লোগোর বদলে generic icon ব্যবহার করা নিরাপদ।"
            )

            icon_col1, icon_col2 = st.columns(2)
            with icon_col1:
                like_upload = st.file_uploader(
                    "👍 Like আইকন",
                    type=["png"],
                    key="social_like_uploader",
                )
                if like_upload:
                    ensure_dirs()
                    st.session_state["social_icon_like_path"] = save_uploaded_file(like_upload, TEMP_DIR)
                    st.image(st.session_state["social_icon_like_path"], width=60)

                share_upload = st.file_uploader(
                    "🔗 Share আইকন",
                    type=["png"],
                    key="social_share_uploader",
                )
                if share_upload:
                    ensure_dirs()
                    st.session_state["social_icon_share_path"] = save_uploaded_file(share_upload, TEMP_DIR)
                    st.image(st.session_state["social_icon_share_path"], width=60)

            with icon_col2:
                comment_upload = st.file_uploader(
                    "💬 Comment আইকন",
                    type=["png"],
                    key="social_comment_uploader",
                )
                if comment_upload:
                    ensure_dirs()
                    st.session_state["social_icon_comment_path"] = save_uploaded_file(comment_upload, TEMP_DIR)
                    st.image(st.session_state["social_icon_comment_path"], width=60)

                subscribe_upload = st.file_uploader(
                    "🔔 Subscribe আইকন",
                    type=["png"],
                    key="social_subscribe_uploader",
                )
                if subscribe_upload:
                    ensure_dirs()
                    st.session_state["social_icon_subscribe_path"] = save_uploaded_file(subscribe_upload, TEMP_DIR)
                    st.image(st.session_state["social_icon_subscribe_path"], width=60)

            active_icon_count = sum(1 for k in [
                "social_icon_like_path", "social_icon_comment_path",
                "social_icon_share_path", "social_icon_subscribe_path"
            ] if st.session_state.get(k))

            if active_icon_count > 0:
                st.success(f"✅ {active_icon_count}টা icon Outro card এ বসবে।")
            else:
                st.caption("ℹ️ কোনো icon upload করা হয়নি — Outro শুধু লেখা/লোগো দিয়ে হবে।")

        st.divider()

        # ── Subtitle (.srt) Export ──────────────────────────────────────────
        st.markdown("### 📝 সাবটাইটেল (.srt)")
        st.session_state["srt_export_enable"] = st.toggle(
            ".srt ফাইল Auto Export করো",
            value=st.session_state["srt_export_enable"],
            help=(
                "ক্লিপে দেওয়া বাংলা ক্যাপশন থেকেই .srt ফাইল বানাবে — "
                "আলাদা করে টাইপ করা লাগবে না। শুধু Final Render এ কাজ করবে, Preview এ না।"
            )
        )

        st.divider()

        # ── Auto Chapter Generator (YouTube Description) ────────────────────
        st.markdown("### 📖 Auto Chapter Generator")
        st.caption(
            "ক্লিপের ক্যাপশন থেকে YouTube chapter timestamp বানায় — "
            "এটা ভিডিওর ভেতরে বসে না, video description এ কপি-পেস্ট করার জন্য।"
        )
        st.session_state["chapter_export_enable"] = st.toggle(
            "Chapter list Auto তৈরি করো",
            value=st.session_state.get("chapter_export_enable", True),
            help=(
                "YouTube নিয়ম: কমপক্ষে ৩টা ক্যাপশন-যুক্ত ক্লিপ থাকতে হবে, "
                "এবং প্রথমটা সবসময় 0:00 থেকে গণনা হয়।"
            )
        )

        st.divider()

        # ── Preset Save / Load ───────────────────────────────────────────────
        st.markdown("### 💾 প্রিসেট সেভ/লোড")
        st.caption("সব সেটিংস (audio, transition, ফন্ট ইত্যাদি) একটা ফাইলে সেভ করে পরের ভিডিওতে reuse করুন")

        preset_col1, preset_col2 = st.columns(2)
        with preset_col1:
            if st.button("💾 প্রিসেট সেভ", use_container_width=True):
                preset_data = export_settings_preset()
                st.session_state["_preset_export_json"] = json.dumps(
                    preset_data, ensure_ascii=False, indent=2
                )

        if "_preset_export_json" in st.session_state:
            st.download_button(
                "⬇️ ডাউনলোড করুন (.json)",
                data=st.session_state["_preset_export_json"],
                file_name=f"farmvideo_preset_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
                mime="application/json",
                use_container_width=True,
            )

        uploaded_preset = st.file_uploader(
            "প্রিসেট লোড করুন (.json)",
            type=["json"],
            key="preset_uploader",
            help="আগে সেভ করা প্রিসেট ফাইল আপলোড করলে সব সেটিংস আবার বসে যাবে।"
        )
        if uploaded_preset is not None:
            preset_key = f"{uploaded_preset.name}_{uploaded_preset.size}"
            if st.session_state.get("_last_loaded_preset") != preset_key:
                try:
                    preset_data = json.loads(uploaded_preset.getvalue().decode("utf-8"))
                    applied = import_settings_preset(preset_data)
                    st.session_state["_last_loaded_preset"] = preset_key
                    st.success(f"✅ {applied}টা সেটিংস লোড হয়েছে! পেজ রিফ্রেশ হচ্ছে...")
                    st.rerun()
                except Exception as e:
                    st.error(f"❌ প্রিসেট লোড করতে সমস্যা হয়েছে: {e}")

    # ═══════════════════════════════════════════════════════════════════════════
    # MAIN CONTENT
    # ═══════════════════════════════════════════════════════════════════════════
    col_left, col_right = st.columns([3, 2], gap="large")

    # ── LEFT: Media Inputs ────────────────────────────────────────────────────
    with col_left:

        # Video upload
        st.markdown("### 📹 ভিডিও ক্লিপ আপলোড")
        st.caption("৪০-৫০টা MP4/MOV · ফাইলের সময় অনুযায়ী auto sort হবে")
        uploaded_videos = st.file_uploader(
            "ক্লিপ drag করুন",
            type=["mp4", "mov"],
            accept_multiple_files=True,
            key="video_uploader",
            label_visibility="collapsed",
        )

        if uploaded_videos:
            ensure_dirs()
            new_clips = []
            for f in uploaded_videos:
                saved = save_uploaded_file(f, TEMP_DIR)
                new_clips.append({
                    "path":              saved,
                    "name":              f.name,
                    "mtime":             probe_file_mtime(saved),
                    "unmuted":           False,
                    "speed":             st.session_state["global_speed"],
                    "label":             "",
                    "label_end_time":    0,      # 0 = পুরো ক্লিপ
                    "text_pos":          "bottom_left",
                    # Watermark (ঐচ্ছিক, প্রতি ক্লিপে আলাদা)
                    "watermark_text":    "",
                    "watermark_opacity": 0.18,
                    "watermark_x":       50.0,   # % — center
                    "watermark_y":       50.0,   # % — center
                    # Zoom/Pan (Ken Burns, ঐচ্ছিক, প্রতি ক্লিপে আলাদা)
                    "zoom_style":        "none",
                    "zoom_strength":     1.0,
                    # Stabilizer (Deshake, ঐচ্ছিক, প্রতি ক্লিপে আলাদা)
                    "stabilize_enable":     st.session_state["global_stabilize_enable"],
                    "stabilize_smoothing":  st.session_state["global_stabilize_smoothing"],
                    "stabilize_shakiness":  st.session_state["global_stabilize_shakiness"],
                    "stabilize_zoom":       st.session_state["global_stabilize_zoom"],
                    "stabilize_mode":       st.session_state["global_stabilize_mode"],
                    # Rotate/Mirror (ঐচ্ছিক, প্রতি ক্লিপে আলাদা)
                    "rotate_degrees":       0,     # 0, 90, 180, 270
                    "mirror_enable":        False,
                    # Lower-Third Banner (ঐচ্ছিক, প্রতি ক্লিপে আলাদা)
                    "lower_third_title":    "",
                    "lower_third_subtitle": "",
                    "lower_third_end_time": 0,     # 0 = পুরো ক্লিপ জুড়ে
                    # Chroma Key (ঐচ্ছিক, প্রতি ক্লিপে আলাদা)
                    "chroma_key_enable":     False,
                    "chroma_key_color":      "0x00FF00",  # সবুজ ডিফল্ট
                    "chroma_key_similarity": 0.15,
                    "chroma_key_blend":      0.05,
                    # Region/Object Blur (Privacy Mask, ঐচ্ছিক, প্রতি ক্লিপে আলাদা)
                    "region_blur_enable":   False,
                    "region_blur_x":        10.0,  # % — উপরের-বাম কোণা থেকে
                    "region_blur_y":        10.0,
                    "region_blur_w":        25.0,  # % — প্রস্থ
                    "region_blur_h":        25.0,  # % — উচ্চতা
                    "region_blur_strength": 20,    # 5–50
                    "region_blur_end_time": 0,     # 0 = পুরো ক্লিপ জুড়ে
                })
            new_clips.sort(key=lambda c: c["mtime"])
            new_paths = [c["path"] for c in new_clips]
            old_paths = [c["path"] for c in st.session_state["clips"]]
            if new_paths != old_paths:
                push_undo_snapshot()
                st.session_state["clips"] = new_clips
            st.success(f"✅ {len(new_clips)}টা ক্লিপ লোড হয়েছে (সময় অনুযায়ী সাজানো)")

        # ── Clip Manager ──────────────────────────────────────────────────────
        if st.session_state["clips"]:
            st.markdown("---")
            st.markdown("### 🎬 ক্লিপ ম্যানেজার")
            st.caption("প্রতিটা ক্লিপে আলাদা টেক্সট, পজিশন, সময়, স্পিড ও Unmute সেট করুন")

            uc, rc, _ = st.columns([1, 1, 4])
            with uc:
                if st.button("↩️ Undo", disabled=not st.session_state["undo_stack"], use_container_width=True):
                    do_undo(); st.rerun()
            with rc:
                if st.button("↪️ Redo", disabled=not st.session_state["redo_stack"], use_container_width=True):
                    do_redo(); st.rerun()

            n_clips = len(st.session_state["clips"])
            for idx, clip in enumerate(st.session_state["clips"]):
                with st.expander(
                    f"{'🔊' if clip['unmuted'] else '🔇'} "
                    f"{idx+1:02d}. {clip['name']}  "
                    f"[{datetime.fromtimestamp(clip['mtime']).strftime('%H:%M')}]  "
                    f"[{clip.get('speed', DEFAULT_SPEED):.1f}×]",
                    expanded=False,
                ):
                    # ── ↕️ Manual Reorder — Auto-sort override ────────────────
                    move_up_col, move_down_col, move_info_col = st.columns([1, 1, 3])
                    with move_up_col:
                        if st.button("⬆️ উপরে", key=f"move_up_{idx}",
                                     disabled=(idx == 0), use_container_width=True):
                            push_undo_snapshot()
                            clips_ref = st.session_state["clips"]
                            clips_ref[idx-1], clips_ref[idx] = clips_ref[idx], clips_ref[idx-1]
                            st.rerun()
                    with move_down_col:
                        if st.button("⬇️ নিচে", key=f"move_down_{idx}",
                                     disabled=(idx == n_clips - 1), use_container_width=True):
                            push_undo_snapshot()
                            clips_ref = st.session_state["clips"]
                            clips_ref[idx+1], clips_ref[idx] = clips_ref[idx], clips_ref[idx+1]
                            st.rerun()
                    with move_info_col:
                        st.caption("ম্যানুয়ালি ক্রম বদলাতে ↑/↓ চাপুন (auto-sort override হবে)")

                    ea, eb, ec = st.columns([1, 1, 1])

                    with ea:
                        # Unmute toggle
                        if mute_all:
                            st.caption("🔇 Master mute চালু")
                            toggled = False
                        else:
                            toggled = st.toggle(
                                "🔊 Unmute + 1× speed",
                                value=clip["unmuted"],
                                key=f"unmute_{idx}",
                            )
                        if toggled != clip["unmuted"]:
                            push_undo_snapshot()
                            st.session_state["clips"][idx]["unmuted"] = toggled
                            st.rerun()

                    with eb:
                        # Per-clip speed (শুধু muted ক্লিপের জন্য)
                        if not clip["unmuted"]:
                            spd = st.slider(
                                "স্পিড",
                                min_value=1.1, max_value=2.0,
                                value=float(clip.get("speed", global_speed)),
                                step=0.1,
                                key=f"speed_{idx}",
                            )
                            if abs(spd - clip.get("speed", global_speed)) > 0.05:
                                st.session_state["clips"][idx]["speed"] = spd
                        else:
                            st.caption("✅ 1× (Unmuted)")

                    with ec:
                        # Text position
                        pos = st.selectbox(
                            "টেক্সট পজিশন",
                            ["bottom_left", "bottom_center", "top_left", "center"],
                            index=["bottom_left", "bottom_center", "top_left", "center"].index(
                                clip.get("text_pos", "bottom_left")
                            ),
                            key=f"pos_{idx}",
                            format_func=lambda x: {
                                "bottom_left":   "নিচে বাম",
                                "bottom_center": "নিচে মাঝে",
                                "top_left":      "উপরে বাম",
                                "center":        "মাঝখানে",
                            }.get(x, x)
                        )
                        st.session_state["clips"][idx]["text_pos"] = pos

                    # Text input — Bangla OK
                    label = st.text_input(
                        "বাংলা টেক্সট (ঐচ্ছিক)",
                        value=clip.get("label", ""),
                        key=f"label_{idx}",
                        placeholder="যেমন: ধানের মাঠ, সকাল ৭টা",
                    )
                    st.session_state["clips"][idx]["label"] = label

                    # কতক্ষণ টেক্সট দেখাবে
                    end_t = st.number_input(
                        "টেক্সট কতক্ষণ দেখাবে (সেকেন্ড, 0 = পুরো ক্লিপ)",
                        min_value=0.0, max_value=300.0,
                        value=float(clip.get("label_end_time", 0)),
                        step=0.5,
                        key=f"end_{idx}",
                        help="0 দিলে ক্লিপের শেষ পর্যন্ত দেখাবে। "
                             "5 দিলে শুধু প্রথম ৫ সেকেন্ড দেখাবে।"
                    )
                    st.session_state["clips"][idx]["label_end_time"] = end_t

                    if label:
                        end_str = f"প্রথম {end_t:.0f} সেকেন্ড" if end_t > 0 else "পুরো ক্লিপ জুড়ে"
                        st.caption(f"📝 টেক্সট দেখাবে: **{end_str}**")

                    # ── 💧 WATERMARK (ঐচ্ছিক, প্রতি ক্লিপে আলাদা) ────────────
                    st.markdown("---")
                    st.markdown("##### 💧 Watermark (হালকা জলছাপ)")
                    st.caption("খালি রাখলে কিছুই দেখাবে না। ঐচ্ছিক — Copyright protection এর জন্য।")

                    wm_text = st.text_input(
                        "Watermark টেক্সট (ঐচ্ছিক)",
                        value=clip.get("watermark_text", ""),
                        key=f"wm_text_{idx}",
                        placeholder="যেমন: farmerkamol.com",
                    )
                    st.session_state["clips"][idx]["watermark_text"] = wm_text

                    if wm_text:
                        wm_c1, wm_c2 = st.columns(2)
                        with wm_c1:
                            wm_op = st.slider(
                                "স্বচ্ছতা (Opacity)",
                                min_value=0.05, max_value=0.60,
                                value=float(clip.get("watermark_opacity", 0.18)),
                                step=0.01,
                                key=f"wm_op_{idx}",
                                help="কম মান = বেশি অদৃশ্য। ডিফল্ট 0.18 (18%) হালকা।"
                            )
                            st.session_state["clips"][idx]["watermark_opacity"] = wm_op
                        with wm_c2:
                            st.caption(f"বর্তমান: **{int(wm_op*100)}%** দৃশ্যমান")

                        wm_x = st.slider(
                            "অনুভূমিক পজিশন (X%)",
                            min_value=0.0, max_value=100.0,
                            value=float(clip.get("watermark_x", 50.0)),
                            step=1.0,
                            key=f"wm_x_{idx}",
                            help="0 = একদম বাম, 50 = মাঝখানে, 100 = একদম ডান"
                        )
                        st.session_state["clips"][idx]["watermark_x"] = wm_x

                        wm_y = st.slider(
                            "উলম্ব পজিশন (Y%)",
                            min_value=0.0, max_value=100.0,
                            value=float(clip.get("watermark_y", 50.0)),
                            step=1.0,
                            key=f"wm_y_{idx}",
                            help="0 = একদম উপরে, 50 = মাঝখানে, 100 = একদম নিচে"
                        )
                        st.session_state["clips"][idx]["watermark_y"] = wm_y

                        st.caption(f"📍 পজিশন: X={wm_x:.0f}%, Y={wm_y:.0f}% · Opacity={int(wm_op*100)}%")

                    # ── 🔍 ZOOM / PAN (Ken Burns, ঐচ্ছিক, প্রতি ক্লিপে আলাদা) ─
                    st.markdown("---")
                    st.markdown("##### 🔍 Zoom / Pan (Ken Burns Effect)")
                    st.caption("ডিফল্ট 'None' — চাইলে ক্যামেরা মুভমেন্ট effect যোগ করুন।")

                    zoom_label = st.selectbox(
                        "Zoom/Pan স্টাইল",
                        options=list(ZOOM_PAN_OPTIONS.keys()),
                        index=list(ZOOM_PAN_OPTIONS.values()).index(
                            clip.get("zoom_style", "none")
                        ),
                        key=f"zoom_style_{idx}",
                    )
                    zoom_style_val = ZOOM_PAN_OPTIONS[zoom_label]
                    st.session_state["clips"][idx]["zoom_style"] = zoom_style_val

                    if zoom_style_val != "none":
                        zoom_strength = st.slider(
                            "Zoom তীব্রতা",
                            min_value=1.02, max_value=1.40,
                            value=float(clip.get("zoom_strength", 1.15)),
                            step=0.01,
                            key=f"zoom_strength_{idx}",
                            help="1.05 = খুব হালকা zoom, 1.15 = মাঝারি (সুপারিশকৃত), 1.30+ = তীব্র zoom"
                        )
                        st.session_state["clips"][idx]["zoom_strength"] = zoom_strength
                        st.caption(
                            f"🎥 {zoom_label} · তীব্রতা: **{zoom_strength:.2f}×** "
                            f"({int((zoom_strength-1)*100)}% zoom)"
                        )
                    else:
                        st.session_state["clips"][idx]["zoom_strength"] = 1.0

                    # ── 🎥 STABILIZER (Deshake, ঐচ্ছিক, প্রতি ক্লিপে আলাদা) ────
                    st.markdown("---")
                    st.markdown("##### 🎥 Video Stabilizer (কাঁপুনি দূর করা)")
                    st.caption(
                        "মাঠে হেঁটে/দৌড়ে শুট করা কাঁপা ফুটেজ স্থির করে। "
                        "⚠️ এটা চালু করলে render সময় উল্লেখযোগ্য বেড়ে যায় (দুই-পাস প্রসেসিং)।"
                    )

                    stab_enable = st.toggle(
                        "🎥 Stabilizer চালু করো (এই ক্লিপের জন্য)",
                        value=clip.get("stabilize_enable", False),
                        key=f"stab_enable_{idx}",
                    )
                    st.session_state["clips"][idx]["stabilize_enable"] = stab_enable

                    if stab_enable:
                        stab_mode = st.radio(
                            "Stabilizer মোড",
                            options=["strong", "light"],
                            index=["strong", "light"].index(clip.get("stabilize_mode", "strong")),
                            key=f"stab_mode_{idx}",
                            format_func=lambda x: (
                                "💪 Strong (দুই-পাস, শক্তিশালী কিন্তু ধীর)" if x == "strong"
                                else "⚡ Light (এক-পাস, দ্রুত কিন্তু কম শক্তিশালী)"
                            ),
                            horizontal=True,
                            help=(
                                "Strong মোড ভারী কাঁপা ফুটেজের জন্য ভালো, কিন্তু ২-৩ গুণ "
                                "বেশি সময় লাগে (দুইবার ভিডিও scan হয়)। Light মোড অনেক "
                                "দ্রুত, হালকা কাঁপুনির জন্য বা slow PC তে উপযোগী।"
                            )
                        )
                        st.session_state["clips"][idx]["stabilize_mode"] = stab_mode

                        if stab_mode == "strong" and not st.session_state.get("vidstab_available"):
                            st.error(
                                "❌ এই FFmpeg বিল্ডে vidstab লাইব্রেরি নেই — Strong মোড কাজ করবে না। "
                                "'Light' মোড বেছে নিন, অথবা Milon ভাইকে 'ffmpeg-release-full' বিল্ড "
                                "ব্যবহার করতে বলুন।"
                            )

                        if stab_mode == "strong":
                            stab_shake = st.slider(
                                "কাঁপুনির তীব্রতা (Shakiness)",
                                min_value=1, max_value=10,
                                value=int(clip.get("stabilize_shakiness", 5)),
                                step=1,
                                key=f"stab_shake_{idx}",
                                help=(
                                    "1 = প্রায় স্থির ভিডিও, 5 = মাঝারি কাঁপা (সুপারিশকৃত), "
                                    "10 = খুব বেশি কাঁপা (হাঁটার সময় হাতে ধরা মোবাইল)"
                                )
                            )
                            st.session_state["clips"][idx]["stabilize_shakiness"] = stab_shake

                            stab_smooth = st.slider(
                                "মসৃণতা (Smoothing)",
                                min_value=5, max_value=50,
                                value=int(clip.get("stabilize_smoothing", 15)),
                                step=1,
                                key=f"stab_smooth_{idx}",
                                help=(
                                    "বেশি মান = আরও মসৃণ ফলাফল, কিন্তু ফ্রেমের কিনারা "
                                    "একটু বেশি crop হতে পারে। 15 সাধারণত ভালো balance।"
                                )
                            )
                            st.session_state["clips"][idx]["stabilize_smoothing"] = stab_smooth
                        else:
                            stab_shake = clip.get("stabilize_shakiness", 5)
                            stab_smooth = clip.get("stabilize_smoothing", 15)
                            st.caption("ℹ️ Light মোডে shakiness/smoothing প্রযোজ্য নয় — deshake filter নিজে থেকেই adjust করে।")

                        stab_zoom = st.slider(
                            "অতিরিক্ত Zoom (%) — Crop পূরণ করতে",
                            min_value=0.0, max_value=20.0,
                            value=float(clip.get("stabilize_zoom", 0.0)),
                            step=1.0,
                            key=f"stab_zoom_{idx}",
                            help=(
                                "Stabilize করার সময় ফ্রেমের কিনারা সামান্য কাঁপা দেখাতে "
                                "পারে (কালো বর্ডার)। এখানে সামান্য zoom দিলে সেই কিনারা "
                                "লুকিয়ে যাবে। 3-5% সাধারণত যথেষ্ট।"
                            )
                        )
                        st.session_state["clips"][idx]["stabilize_zoom"] = stab_zoom

                        time_estimate = "~২-৩ গুণ বেশি" if stab_mode == "strong" else "~২০-৩০% বেশি"
                        st.warning(
                            f"⚠️ Stabilizer চালু ({stab_mode} মোড) — "
                            f"Zoom={stab_zoom:.0f}% · "
                            f"এই ক্লিপের render সময় {time_estimate} লাগবে।"
                        )

                    # ── 🔄 ROTATE / MIRROR ─────────────────────────────────────
                    st.markdown("---")
                    st.markdown("##### 🔄 Rotate / Mirror")

                    rot_col1, rot_col2 = st.columns(2)
                    with rot_col1:
                        rotate_val = st.selectbox(
                            "ঘোরানো (Rotate)",
                            options=[0, 90, 180, 270],
                            index=[0, 90, 180, 270].index(clip.get("rotate_degrees", 0)),
                            key=f"rotate_{idx}",
                            format_func=lambda x: f"{x}°" if x > 0 else "কোনো পরিবর্তন নেই",
                        )
                        st.session_state["clips"][idx]["rotate_degrees"] = rotate_val
                    with rot_col2:
                        mirror_val = st.toggle(
                            "🪞 Mirror (আয়না)",
                            value=clip.get("mirror_enable", False),
                            key=f"mirror_{idx}",
                            help="ভিডিও অনুভূমিকভাবে উল্টে দেয় (আয়নার প্রতিফলনের মতো)।"
                        )
                        st.session_state["clips"][idx]["mirror_enable"] = mirror_val

                    # ── 🏷️ LOWER-THIRD BANNER ──────────────────────────────────
                    st.markdown("---")
                    st.markdown("##### 🏷️ Lower-Third Banner")
                    st.caption("নাম/পদবি জাতীয় তথ্যসূচক ব্যানার — স্ক্রিনের নিচে বসে")

                    lt_title_val = st.text_input(
                        "শিরোনাম (বড় লেখা)",
                        value=clip.get("lower_third_title", ""),
                        key=f"lt_title_{idx}",
                        placeholder="যেমন: কমল হোসেন",
                    )
                    st.session_state["clips"][idx]["lower_third_title"] = lt_title_val

                    if lt_title_val:
                        lt_subtitle_val = st.text_input(
                            "উপ-শিরোনাম (ঐচ্ছিক)",
                            value=clip.get("lower_third_subtitle", ""),
                            key=f"lt_sub_{idx}",
                            placeholder="যেমন: মালিক, শাধীনতা ফার্ম",
                        )
                        st.session_state["clips"][idx]["lower_third_subtitle"] = lt_subtitle_val

                        lt_end_val = st.number_input(
                            "কতক্ষণ দেখাবে (সেকেন্ড, 0 = পুরো ক্লিপ)",
                            min_value=0.0, max_value=300.0,
                            value=float(clip.get("lower_third_end_time", 0)),
                            step=0.5,
                            key=f"lt_end_{idx}",
                        )
                        st.session_state["clips"][idx]["lower_third_end_time"] = lt_end_val

                    # ── 🟢 CHROMA KEY (Green Screen) ────────────────────────────
                    st.markdown("---")
                    st.markdown("##### 🟢 Chroma Key (Green Screen Removal)")
                    st.caption(
                        "⚠️ শুধু uniform (একরঙা) green/blue screen ফুটেজে কাজ করবে — "
                        "সাধারণ farm ফুটেজে এটা প্রযোজ্য না।"
                    )

                    chroma_val = st.toggle(
                        "🟢 Chroma Key চালু করো",
                        value=clip.get("chroma_key_enable", False),
                        key=f"chroma_enable_{idx}",
                    )
                    st.session_state["clips"][idx]["chroma_key_enable"] = chroma_val

                    if chroma_val:
                        chroma_color_label = st.selectbox(
                            "Key রঙ",
                            options=["0x00FF00", "0x0000FF"],
                            index=["0x00FF00", "0x0000FF"].index(
                                clip.get("chroma_key_color", "0x00FF00")
                            ),
                            key=f"chroma_color_{idx}",
                            format_func=lambda x: "সবুজ (Green Screen)" if x == "0x00FF00" else "নীল (Blue Screen)",
                        )
                        st.session_state["clips"][idx]["chroma_key_color"] = chroma_color_label

                        chroma_sim = st.slider(
                            "Similarity (কতটা কাছাকাছি রঙ ধরা হবে)",
                            min_value=0.01, max_value=0.50,
                            value=float(clip.get("chroma_key_similarity", 0.15)),
                            step=0.01,
                            key=f"chroma_sim_{idx}",
                        )
                        st.session_state["clips"][idx]["chroma_key_similarity"] = chroma_sim

                        chroma_blend_val = st.slider(
                            "Blend (কিনারা মসৃণতা)",
                            min_value=0.0, max_value=0.5,
                            value=float(clip.get("chroma_key_blend", 0.05)),
                            step=0.01,
                            key=f"chroma_blend_{idx}",
                        )
                        st.session_state["clips"][idx]["chroma_key_blend"] = chroma_blend_val

                    # ── 🔒 REGION / OBJECT BLUR (Privacy Mask) ──────────────────
                    st.markdown("---")
                    st.markdown("##### 🔒 Region Blur (Privacy Mask)")
                    st.caption(
                        "নির্দিষ্ট অংশ (মুখ, নম্বরপ্লেট ইত্যাদি) ঝাপসা করে আড়াল করে। "
                        "⚠️ এটা একটা **স্থির** অঞ্চল ব্লার করে — নড়াচড়া করা বস্তু "
                        "ট্র্যাক করবে না, তাই স্থির/কম-নড়া বিষয়ের জন্য সবচেয়ে ভালো।"
                    )

                    blur_enable_val = st.toggle(
                        "🔒 Region Blur চালু করো",
                        value=clip.get("region_blur_enable", False),
                        key=f"blur_enable_{idx}",
                    )
                    st.session_state["clips"][idx]["region_blur_enable"] = blur_enable_val

                    if blur_enable_val:
                        st.caption("ব্লার-করা অঞ্চলের অবস্থান ও আকার (ফ্রেমের % হিসেবে):")

                        blur_pos_col1, blur_pos_col2 = st.columns(2)
                        with blur_pos_col1:
                            blur_x_val = st.slider(
                                "X পজিশন (%) — বাম থেকে",
                                min_value=0.0, max_value=90.0,
                                value=float(clip.get("region_blur_x", 10.0)),
                                step=1.0,
                                key=f"blur_x_{idx}",
                            )
                            st.session_state["clips"][idx]["region_blur_x"] = blur_x_val

                            blur_w_val = st.slider(
                                "প্রস্থ (%)",
                                min_value=5.0, max_value=100.0,
                                value=float(clip.get("region_blur_w", 25.0)),
                                step=1.0,
                                key=f"blur_w_{idx}",
                            )
                            st.session_state["clips"][idx]["region_blur_w"] = blur_w_val

                        with blur_pos_col2:
                            blur_y_val = st.slider(
                                "Y পজিশন (%) — উপর থেকে",
                                min_value=0.0, max_value=90.0,
                                value=float(clip.get("region_blur_y", 10.0)),
                                step=1.0,
                                key=f"blur_y_{idx}",
                            )
                            st.session_state["clips"][idx]["region_blur_y"] = blur_y_val

                            blur_h_val = st.slider(
                                "উচ্চতা (%)",
                                min_value=5.0, max_value=100.0,
                                value=float(clip.get("region_blur_h", 25.0)),
                                step=1.0,
                                key=f"blur_h_{idx}",
                            )
                            st.session_state["clips"][idx]["region_blur_h"] = blur_h_val

                        blur_strength_val = st.slider(
                            "Blur তীব্রতা",
                            min_value=5, max_value=50,
                            value=int(clip.get("region_blur_strength", 20)),
                            step=1,
                            key=f"blur_strength_{idx}",
                            help="বেশি মান = আরও বেশি ঝাপসা।"
                        )
                        st.session_state["clips"][idx]["region_blur_strength"] = blur_strength_val

                        blur_end_val = st.number_input(
                            "কতক্ষণ ব্লার থাকবে (সেকেন্ড, 0 = পুরো ক্লিপ)",
                            min_value=0.0, max_value=300.0,
                            value=float(clip.get("region_blur_end_time", 0)),
                            step=0.5,
                            key=f"blur_end_{idx}",
                        )
                        st.session_state["clips"][idx]["region_blur_end_time"] = blur_end_val

                        st.info(
                            f"🔒 ব্লার অঞ্চল: X={blur_x_val:.0f}%, Y={blur_y_val:.0f}%, "
                            f"প্রস্থ={blur_w_val:.0f}%, উচ্চতা={blur_h_val:.0f}%"
                        )

                    # ── ✂️ SPLIT THIS CLIP ────────────────────────────────────
                    st.markdown("---")
                    st.markdown("##### ✂️ এই ক্লিপ Split করুন")

                    clip_dur = probe_duration(clip["path"])
                    if clip_dur > 0:
                        st.caption(
                            f"ক্লিপের মোট সময়: **{clip_dur:.1f} সেকেন্ড** "
                            f"({int(clip_dur//60)}m {int(clip_dur%60)}s)"
                        )

                        split_input = st.text_input(
                            "কোথায় কাটবেন? (সেকেন্ড, কমা দিয়ে আলাদা করুন)",
                            value="",
                            key=f"split_times_{idx}",
                            placeholder=f"যেমন: 5, 12.5, 20   (সর্বোচ্চ {clip_dur:.0f}s)",
                            help=(
                                "উদাহরণ: '10, 25' দিলে ক্লিপটা ৩ ভাগে কাটবে: "
                                "0–10s, 10–25s, 25–শেষ।"
                            )
                        )

                        if st.button(
                            f"✂️ Split করুন — ক্লিপ {idx+1:02d}",
                            key=f"do_split_{idx}",
                            use_container_width=True,
                        ):
                            # Parse split times from text input
                            raw = split_input.strip()
                            if not raw:
                                st.warning("⚠️ কোনো সময় দেননি! যেমন: 10, 20")
                            else:
                                try:
                                    times = [float(t.strip()) for t in raw.split(",") if t.strip()]
                                    invalid = [t for t in times if t <= 0 or t >= clip_dur]
                                    if invalid:
                                        st.error(
                                            f"❌ এই সময়গুলো ঠিক নেই: {invalid}. "
                                            f"0 থেকে {clip_dur:.1f} এর মধ্যে দিন।"
                                        )
                                    else:
                                        with st.spinner(f"✂️ ক্লিপ {idx+1} split হচ্ছে..."):
                                            ensure_dirs()
                                            new_segs = split_clip(
                                                clip_info=clip,
                                                split_times=times,
                                                output_dir=TEMP_DIR,
                                            )
                                        if new_segs:
                                            push_undo_snapshot()
                                            # Replace this clip with the segments
                                            clips_list = st.session_state["clips"]
                                            clips_list[idx:idx+1] = new_segs
                                            st.success(
                                                f"✅ ক্লিপ {idx+1} → "
                                                f"**{len(new_segs)}টা** অংশে split হয়েছে!"
                                            )
                                            st.rerun()
                                        else:
                                            st.error("❌ Split failed। FFmpeg error দেখুন।")
                                except ValueError:
                                    st.error("❌ সঠিক সংখ্যা দিন। যেমন: 10, 20.5, 35")
                    else:
                        st.caption("⚠️ ক্লিপের duration বের করা যাচ্ছে না।")

                    # ── 🗑️ DELETE THIS CLIP ───────────────────────────────────
                    st.markdown("---")
                    st.markdown("##### 🗑️ ক্লিপ Delete করুন")

                    # Split হওয়া segment গুলো delete করার জন্য checkboxes
                    # অথবা যেকোনো ক্লিপ সরাসরি delete করার জন্য একটা বাটন

                    del_col1, del_col2 = st.columns([2, 1])
                    with del_col1:
                        st.caption(
                            "এই ক্লিপটা লিস্ট থেকে সরিয়ে দেবে। "
                            "Undo দিয়ে ফিরিয়ে আনতে পারবেন।"
                        )
                    with del_col2:
                        if st.button(
                            "🗑️ Delete",
                            key=f"delete_clip_{idx}",
                            use_container_width=True,
                            type="secondary",
                        ):
                            push_undo_snapshot()
                            st.session_state["clips"].pop(idx)
                            st.success(f"✅ ক্লিপ {idx+1} ({clip['name']}) সরানো হয়েছে।")
                            st.rerun()

        # ── Audio + Logo ──────────────────────────────────────────────────────
        st.markdown("---")
        st.markdown("### 🎙️ Voiceover")
        st.caption("WAV / MP3 · EQ + Gate + Loudnorm auto apply হবে")
        uploaded_audio = st.file_uploader(
            "Voiceover drop করুন",
            type=["wav", "mp3"],
            key="audio_uploader",
            label_visibility="collapsed",
        )
        voiceover_path = None
        if uploaded_audio:
            ensure_dirs()
            voiceover_path = save_uploaded_file(uploaded_audio, TEMP_DIR)
            dur = probe_duration(voiceover_path)
            mins, secs = divmod(int(dur), 60)
            st.success(f"✅ {uploaded_audio.name} · {mins}m {secs}s")

        # ── Background Music ─────────────────────────────────────────────────
        bg_music_path = None
        if st.session_state["bg_music_enable"]:
            st.markdown("---")
            st.markdown("### 🎵 ব্যাকগ্রাউন্ড মিউজিক")
            st.caption("Voiceover থেকে আলাদা — পুরো ভিডিও জুড়ে খুব কম volume এ loop হবে")
            uploaded_bg_music = st.file_uploader(
                "Background Music drop করুন",
                type=["wav", "mp3"],
                key="bg_music_uploader",
                label_visibility="collapsed",
            )
            if uploaded_bg_music:
                ensure_dirs()
                bg_music_path = save_uploaded_file(uploaded_bg_music, TEMP_DIR)
                dur = probe_duration(bg_music_path)
                mins, secs = divmod(int(dur), 60)
                st.success(f"✅ {uploaded_bg_music.name} · {mins}m {secs}s · Volume: {int(st.session_state['bg_music_volume']*100)}%")

        st.markdown("---")
        st.markdown("### 🖼️ Logo")
        st.caption("PNG · top-right · 60% opacity · auto burn-in")
        uploaded_logo = st.file_uploader(
            "Logo drop করুন",
            type=["png"],
            key="logo_uploader",
            label_visibility="collapsed",
        )
        logo_path = None
        if uploaded_logo:
            ensure_dirs()
            logo_path = save_uploaded_file(uploaded_logo, TEMP_DIR)
            st.image(logo_path, width=100, caption="Logo preview")

    # ── RIGHT: Render Controls ────────────────────────────────────────────────
    with col_right:
        st.markdown("### 🚀 রেন্ডার")

        clips_ready = len(st.session_state["clips"]) > 0
        if not clips_ready:
            st.warning("⬅️ আগে ক্লিপ আপলোড করুন")

        audio_settings = {
            "vo_rnnoise":       st.session_state["vo_rnnoise"],
            "vo_eq_enable":     st.session_state["vo_eq_enable"],
            "vo_loudnorm":      st.session_state["vo_loudnorm"],
            "vo_loudnorm_twopass": st.session_state["vo_loudnorm_twopass"],
            "vo_limiter":       st.session_state["vo_limiter"],
            "vo_limiter_level": st.session_state["vo_limiter_level"],
            "vo_noise_gate":    st.session_state["vo_noise_gate"],
            "vo_lcut":          st.session_state["vo_lcut"],
            "vo_pitch_correct": st.session_state["vo_pitch_correct"],
            "vo_ducking":       st.session_state["vo_ducking"],
            "vo_aac_320":       st.session_state["vo_aac_320"],
            # ৮. Echo
            "vo_echo":          st.session_state["vo_echo"],
            "vo_echo_delay":    st.session_state["vo_echo_delay"],
            "vo_echo_decay":    st.session_state["vo_echo_decay"],
            # ৯-১০. Voice cleanup
            "vo_declicker":       st.session_state["vo_declicker"],
            "vo_deesser":         st.session_state["vo_deesser"],
            "vo_deesser_freq":    st.session_state["vo_deesser_freq"],
            "vo_deesser_amount":  st.session_state["vo_deesser_amount"],
            # ১১-১৩. ফিল্ড রেকর্ডিং ক্লিন-আপ
            "vo_bandpass":        st.session_state["vo_bandpass"],
            "vo_bandpass_low":    st.session_state["vo_bandpass_low"],
            "vo_bandpass_high":   st.session_state["vo_bandpass_high"],
            "vo_wind_filter":     st.session_state["vo_wind_filter"],
            "vo_wind_cutoff":     st.session_state["vo_wind_cutoff"],
            "vo_hum_removal":     st.session_state["vo_hum_removal"],
            "vo_hum_freq":        st.session_state["vo_hum_freq"],
            "vo_afftdn":          st.session_state["vo_afftdn"],
            "vo_afftdn_amount":   st.session_state["vo_afftdn_amount"],
            # ১৪-১৭. কণ্ঠ পলিশ
            "vo_multiband":       st.session_state["vo_multiband"],
            "vo_agc":             st.session_state["vo_agc"],
            "vo_exciter":         st.session_state["vo_exciter"],
            "vo_exciter_amount":  st.session_state["vo_exciter_amount"],
            "vo_stereo_widen":    st.session_state["vo_stereo_widen"],
            "vo_widen_amount":    st.session_state["vo_widen_amount"],
            # ১৮. Silence Trimmer
            "vo_silence_trim":       st.session_state["vo_silence_trim"],
            "vo_silence_threshold":  st.session_state["vo_silence_threshold"],
            "vo_silence_min_dur":    st.session_state["vo_silence_min_dur"],
        }

        st.markdown("---")
        st.markdown("#### 👁️ প্রিভিউ")
        st.caption("কম রেজোলিউশনে দ্রুত draft — দেখুন ঠিক আছে কিনা")

        if st.button("🎬 Preview তৈরি করুন", disabled=not clips_ready,
                     use_container_width=True, type="secondary"):
            with st.spinner("Preview render হচ্ছে..."):
                st.session_state["render_error"]  = ""
                st.session_state["preview_path"]  = None
                ok, path, err = render_pipeline(
                    clips=st.session_state["clips"],
                    voiceover_path=voiceover_path,
                    logo_path=logo_path,
                    profile=profile,
                    transition_type=st.session_state["transition_type"],
                    audio_settings=audio_settings,
                    bg_music_path=bg_music_path,
                    bg_music_volume=st.session_state["bg_music_volume"],
                    is_preview=True,
                )
                if ok:
                    st.session_state["preview_path"] = path
                else:
                    st.session_state["render_error"] = err

        if st.session_state["preview_path"] and os.path.exists(st.session_state["preview_path"]):
            st.success("✅ Preview তৈরি!")
            st.video(st.session_state["preview_path"])

        st.markdown("---")
        st.markdown("#### 🏆 ফাইনাল ভিডিও")
        if batch_mode:
            _batch_list = st.session_state.get("batch_profiles_selected", [])
            st.caption(f"📦 Batch mode: {len(_batch_list)}টা ফরম্যাট · NVENC")
        else:
            st.caption(f"`{profile['w']}×{profile['h']}` · `{profile['bitrate']}` · NVENC")

        c_btn, c_dl = st.columns(2)
        with c_btn:
            render_btn_label = (
                f"📦 Batch Render ({len(st.session_state.get('batch_profiles_selected', []))}টা ফরম্যাট)"
                if batch_mode else "⚡ Final Render"
            )
            batch_ready = batch_mode and len(st.session_state.get("batch_profiles_selected", [])) > 0
            render_disabled = not clips_ready or (batch_mode and not batch_ready)

            if st.button(render_btn_label, disabled=render_disabled,
                         use_container_width=True, type="primary"):
                st.session_state["render_error"]  = ""
                st.session_state["final_path"]    = None
                st.session_state["srt_last_path"] = None
                st.session_state["chapter_last_path"] = None
                st.session_state["batch_final_paths"] = []

                if batch_mode:
                    # ── Batch Export: প্রতিটা নির্বাচিত ফরম্যাটের জন্য আলাদাভাবে
                    # সম্পূর্ণ render_pipeline চালানো হয় — প্রতিটার জন্য নিজস্ব
                    # scale/crop/bitrate হবে, কিন্তু বাকি সব সেটিংস (audio,
                    # transition, intro/outro, watermark ইত্যাদি) একই থাকবে।
                    batch_profiles = st.session_state["batch_profiles_selected"]
                    batch_results  = []
                    batch_progress = st.progress(0, text="Batch export শুরু হচ্ছে...")

                    for b_idx, b_profile_name in enumerate(batch_profiles):
                        b_profile = PROFILES[b_profile_name]
                        batch_progress.progress(
                            b_idx / len(batch_profiles),
                            text=f"রেন্ডার হচ্ছে ({b_idx+1}/{len(batch_profiles)}): {b_profile_name}"
                        )
                        with st.spinner(f"'{b_profile_name}' ফরম্যাট render হচ্ছে..."):
                            ok, path, err = render_pipeline(
                                clips=st.session_state["clips"],
                                voiceover_path=voiceover_path,
                                logo_path=logo_path,
                                profile=b_profile,
                                transition_type=st.session_state["transition_type"],
                                audio_settings=audio_settings,
                                bg_music_path=bg_music_path,
                                bg_music_volume=st.session_state["bg_music_volume"],
                                is_preview=False,
                            )
                        if ok:
                            batch_results.append({"name": b_profile_name, "path": path})
                        else:
                            st.session_state["render_error"] = f"'{b_profile_name}' এ ব্যর্থ: {err}"
                            break

                    batch_progress.progress(1.0, text="Batch export সম্পন্ন ✓")
                    st.session_state["batch_final_paths"] = batch_results
                    if batch_results:
                        # প্রথমটা "final_path" হিসেবেও সেট করি backward-compatibility এর জন্য
                        st.session_state["final_path"] = batch_results[0]["path"]

                else:
                    with st.spinner("Final render হচ্ছে, অপেক্ষা করুন..."):
                        ok, path, err = render_pipeline(
                            clips=st.session_state["clips"],
                            voiceover_path=voiceover_path,
                            logo_path=logo_path,
                            profile=profile,
                            transition_type=st.session_state["transition_type"],
                            audio_settings=audio_settings,
                            bg_music_path=bg_music_path,
                            bg_music_volume=st.session_state["bg_music_volume"],
                            is_preview=False,
                        )
                        if ok:
                            st.session_state["final_path"] = path
                        else:
                            st.session_state["render_error"] = err

        # ── Batch Export ফলাফল — প্রতিটা ফরম্যাটের জন্য আলাদা ডাউনলোড বাটন ──
        if st.session_state.get("batch_final_paths"):
            st.markdown("##### 📦 Batch Export ফলাফল")
            for item in st.session_state["batch_final_paths"]:
                if os.path.exists(item["path"]):
                    with open(item["path"], "rb") as fh:
                        st.download_button(
                            f"💾 {item['name']} ডাউনলোড",
                            data=fh,
                            file_name=os.path.basename(item["path"]),
                            mime="video/mp4",
                            use_container_width=True,
                            key=f"batch_dl_{item['name']}",
                        )
            st.success(f"✅ {len(st.session_state['batch_final_paths'])}টা ফরম্যাট সফলভাবে render হয়েছে!")

        elif st.session_state.get("final_path") and os.path.exists(st.session_state["final_path"]):
            with c_dl:
                with open(st.session_state["final_path"], "rb") as fh:
                    st.download_button(
                        "💾 PC তে সেভ",
                        data=fh,
                        file_name=os.path.basename(st.session_state["final_path"]),
                        mime="video/mp4",
                        use_container_width=True,
                    )
            st.success(f"✅ সেভ হয়েছে:\n`{st.session_state['final_path']}`")

            # SRT ফাইল থাকলে সেটার জন্যও আলাদা ডাউনলোড বাটন
            srt_path = st.session_state.get("srt_last_path")
            if srt_path and os.path.exists(srt_path):
                with open(srt_path, "rb") as fh:
                    st.download_button(
                        "📝 Subtitle (.srt) ডাউনলোড",
                        data=fh,
                        file_name=os.path.basename(srt_path),
                        mime="text/plain",
                        use_container_width=True,
                    )
                st.caption(f"📁 `{srt_path}`")
            elif st.session_state.get("srt_export_enable"):
                st.caption("ℹ️ কোনো ক্লিপে ক্যাপশন টেক্সট না থাকায় .srt ফাইল তৈরি হয়নি।")

            # Chapter list থাকলে সেটার জন্যও ডাউনলোড বাটন + কপি-করার textarea
            chapter_path = st.session_state.get("chapter_last_path")
            if chapter_path and os.path.exists(chapter_path):
                with open(chapter_path, "rb") as fh:
                    st.download_button(
                        "📖 YouTube Chapters (.txt) ডাউনলোড",
                        data=fh,
                        file_name=os.path.basename(chapter_path),
                        mime="text/plain",
                        use_container_width=True,
                    )
                st.caption(f"📁 `{chapter_path}`")

                # সরাসরি কপি করার জন্য textarea — YouTube description এ পেস্ট করতে সুবিধা
                chapter_content = st.session_state.get("chapter_last_content", "")
                if chapter_content:
                    chapter_lines_count = len(chapter_content.strip().split("\n"))
                    if chapter_lines_count < 3:
                        st.warning(
                            f"⚠️ মাত্র {chapter_lines_count}টা chapter পাওয়া গেছে। "
                            f"YouTube এ chapter bar দেখাতে হলে কমপক্ষে ৩টা লাগবে — "
                            f"আরও ক্লিপে ক্যাপশন যোগ করুন।"
                        )
                    with st.expander("📋 Chapter List দেখুন / কপি করুন", expanded=False):
                        st.text_area(
                            "YouTube Description এ পেস্ট করুন",
                            value=chapter_content,
                            height=150,
                            label_visibility="collapsed",
                        )
            elif st.session_state.get("chapter_export_enable"):
                st.caption("ℹ️ কোনো ক্লিপে ক্যাপশন টেক্সট না থাকায় chapter list তৈরি হয়নি।")

        # Error display
        if st.session_state["render_error"]:
            st.error(f"❌ Error:\n```\n{st.session_state['render_error']}\n```")
            st.markdown(
                "**সমাধান:**\n"
                "- `ffmpeg\\bin\\ffmpeg.exe` আছে কিনা দেখুন\n"
                "- `fonts\\` এ `.ttf` ফাইল আছে কিনা দেখুন\n"
                "- NVIDIA driver আপডেট করুন (NVENC এর জন্য)\n"
            )

        st.markdown("---")

        # Pipeline summary
        with st.expander("📋 পাইপলাইন সারসংক্ষেপ", expanded=False):
            spd = st.session_state["global_speed"]
            tr  = transition_label
            st.markdown(f"""
| ধাপ | কাজ | সেটিং |
|-----|-----|--------|
| ১ | Scale/Crop | `{profile['w']}×{profile['h']}` · {profile['crop_mode']} |
| ২ | FPS Lock | `{TARGET_FPS} fps` |
| ৩ | Speed | `{spd}×` (muted) / `1×` (unmuted) |
| ৪ | Bangla Text | নির্দিষ্ট সময় বা পুরো ক্লিপ · ফন্ট: **{st.session_state['selected_bangla_font']}** |
| ৫ | Logo | top-right · 60% opacity |
| ৬ | Transition | {tr} · `{XFADE_DURATION}s` বেস duration |
| ৬.১ | Adaptive Duration | {'✅ চালু' if st.session_state.get('transition_adaptive_duration') else '❌ বন্ধ (ফিক্সড)'} |
| ৬.২ | Audio Curve | `{st.session_state.get('transition_audio_curve', 'tri')}` |
| ৬.৩ | Auto-Level Match | {'✅ চালু' if st.session_state.get('transition_auto_level_match') else '❌ বন্ধ'} |
| ৬.৪ | Whoosh SFX | {'✅ চালু' if st.session_state.get('transition_whoosh_enable') and st.session_state.get('transition_whoosh_path') else '❌ বন্ধ'} |
| ৬.৫ | Color Grading | {color_label} |
| ৬.৬ | Intro Card | {'✅ ' + str(st.session_state['intro_duration']) + 's' if st.session_state['intro_enable'] else '❌ বন্ধ'} |
| ৬.৭ | Outro Card | {'✅ ' + str(st.session_state['outro_duration']) + 's' if st.session_state['outro_enable'] else '❌ বন্ধ'} |
| ৬.৭৫ | Social Media Icons | {sum(1 for k in ['social_icon_like_path','social_icon_comment_path','social_icon_share_path','social_icon_subscribe_path'] if st.session_state.get(k))}টা আইকন সেট করা |
| ৬.৮ | SRT Subtitle Export | {'✅ চালু' if st.session_state['srt_export_enable'] else '❌ বন্ধ'} |
| ৬.৯ | Stabilizer (Deshake) | {sum(1 for c in st.session_state['clips'] if c.get('stabilize_enable'))}টা ক্লিপে চালু ({sum(1 for c in st.session_state['clips'] if c.get('stabilize_enable') and c.get('stabilize_mode','strong')=='strong')} Strong, {sum(1 for c in st.session_state['clips'] if c.get('stabilize_enable') and c.get('stabilize_mode')=='light')} Light) |
| ৭.০ | Rotate/Mirror | {sum(1 for c in st.session_state['clips'] if c.get('rotate_degrees',0)>0 or c.get('mirror_enable'))}টা ক্লিপে প্রয়োগ |
| ৭.১ | Lower-Third Banner | {sum(1 for c in st.session_state['clips'] if c.get('lower_third_title'))}টা ক্লিপে আছে |
| ৭.২ | Chroma Key | {sum(1 for c in st.session_state['clips'] if c.get('chroma_key_enable'))}টা ক্লিপে চালু |
| ৭.২৫ | Region Blur (Privacy) | {sum(1 for c in st.session_state['clips'] if c.get('region_blur_enable'))}টা ক্লিপে চালু |
| ৭.৩ | Audio Fade In | {'✅ ' + str(st.session_state['audio_fade_in_sec']) + 's' if st.session_state['audio_fade_in_enable'] else '❌ বন্ধ'} |
| ৭.৪ | Audio Fade Out | {'✅ ' + str(st.session_state['audio_fade_out_sec']) + 's' if st.session_state['audio_fade_out_enable'] else '❌ বন্ধ'} |
| ৭.৫ | YouTube Chapter Export | {'✅ চালু' if st.session_state.get('chapter_export_enable') else '❌ বন্ধ'} |
| ০ | AI Denoise (RNNoise) | {'✅ চালু' if audio_settings.get('vo_rnnoise') and os.path.exists(RNNOISE_MODEL_PATH) else '❌ বন্ধ/মডেল নেই'} |
| ৭ | Vocal EQ | {'✅' if audio_settings['vo_eq_enable'] else '❌'} |
| ৮ | Loudnorm | {'✅ Two-Pass' if audio_settings.get('vo_loudnorm_twopass') and audio_settings['vo_loudnorm'] else ('✅ Single-Pass' if audio_settings['vo_loudnorm'] else '❌')} EBU R128 -16 LUFS |
| ৮.৫ | Peak Limiter | {'✅ সিলিং ' + str(audio_settings.get('vo_limiter_level', 0.95)) if audio_settings.get('vo_limiter') else '❌ বন্ধ'} |
| ৯ | Noise Gate | {'✅' if audio_settings['vo_noise_gate'] else '❌'} |
| ১০ | L-Cut | {'✅' if audio_settings['vo_lcut'] else '❌'} `{JCUT_OFFSET}s` |
| ১১ | Pitch Correct | {'✅' if audio_settings['vo_pitch_correct'] else '❌'} atempo |
| ১২ | Amb. Ducking | {'✅' if audio_settings['vo_ducking'] else '❌'} 85% duck |
| ১৩ | Audio Encoder | {'AAC 320kbps' if audio_settings['vo_aac_320'] else 'AAC 192kbps'} |
| ১৪ | Echo/Reverb | {'✅ চালু — delay=' + str(audio_settings.get('vo_echo_delay','')) + 'ms, decay=' + str(audio_settings.get('vo_echo_decay','')) if audio_settings.get('vo_echo') else '❌ বন্ধ'} |
| ১৫ | De-clicker | {'✅' if audio_settings.get('vo_declicker') else '❌'} প্লোসিভ/ক্লিক শব্দ মসৃণ |
| ১৬ | De-esser | {'✅ তীব্রতা ' + str(int(audio_settings.get('vo_deesser_amount',0)*100)) + '%' if audio_settings.get('vo_deesser') else '❌ বন্ধ'} |
| ১৭ | Band-pass Filter | {'✅ ' + str(int(audio_settings.get('vo_bandpass_low',0))) + 'Hz–' + str(int(audio_settings.get('vo_bandpass_high',0))) + 'Hz' if audio_settings.get('vo_bandpass') else '❌ বন্ধ'} |
| ১৮ | Wind Noise Filter | {'✅ cutoff ' + str(int(audio_settings.get('vo_wind_cutoff',0))) + 'Hz' if audio_settings.get('vo_wind_filter') else '❌ বন্ধ'} |
| ১৯ | Hum Removal | {'✅ ' + str(audio_settings.get('vo_hum_freq','')) + 'Hz' if audio_settings.get('vo_hum_removal') else '❌ বন্ধ'} |
| ২০ | Multiband Compressor | {'✅' if audio_settings.get('vo_multiband') else '❌'} |
| ২১ | Auto Gain Control | {'✅' if audio_settings.get('vo_agc') else '❌'} |
| ২২ | Harmonic Exciter | {'✅ তীব্রতা ' + str(int(audio_settings.get('vo_exciter_amount',0)*100)) + '%' if audio_settings.get('vo_exciter') else '❌ বন্ধ'} |
| ২৩ | Stereo Widening | {'✅ ' + str(audio_settings.get('vo_widen_amount','')) + '×' if audio_settings.get('vo_stereo_widen') else '❌ বন্ধ'} |
| ২৪ | Silence Trimmer | {'✅ threshold ' + str(audio_settings.get('vo_silence_threshold','')) + 'dB' if audio_settings.get('vo_silence_trim') else '❌ বন্ধ'} |
| ১৪ | Video Encoder | NVENC → libx264 fallback |
            """)

        if st.session_state["clips"]:
            with st.expander(f"🗂️ ক্লিপ অর্ডার ({len(st.session_state['clips'])}টা)", expanded=False):
                for i, c in enumerate(st.session_state["clips"]):
                    t = datetime.fromtimestamp(c["mtime"]).strftime("%H:%M:%S")
                    spd_s = "🔊 1×" if c["unmuted"] else f"🔇 {c.get('speed', DEFAULT_SPEED):.1f}×"
                    lbl   = f' — "{c["label"]}"' if c.get("label") else ""
                    end_s = f' [{c["label_end_time"]:.0f}s]' if c.get("label_end_time") else ""
                    stab_s = ' 🎥' if c.get("stabilize_enable") else ""
                    rot_s  = f' 🔄{c.get("rotate_degrees")}°' if c.get("rotate_degrees", 0) > 0 else ""
                    mir_s  = ' 🪞' if c.get("mirror_enable") else ""
                    chroma_s = ' 🟢' if c.get("chroma_key_enable") else ""
                    lt_s   = ' 🏷️' if c.get("lower_third_title") else ""
                    blur_s = ' 🔒' if c.get("region_blur_enable") else ""
                    st.markdown(
                        f"`{i+1:02d}.` `{t}` {spd_s} **{c['name']}**"
                        f"{lbl}{end_s}{stab_s}{rot_s}{mir_s}{chroma_s}{lt_s}{blur_s}"
                    )


# ─────────────────────────────────────────────────────────────────────────────
def main() -> None:
    init_session_state()
    render_ui()

if __name__ == "__main__":
    main()