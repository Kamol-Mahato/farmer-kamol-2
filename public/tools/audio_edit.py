"""অডিও এডিট ট্যাব — নিজের রেকর্ড করা ভয়েস পরিষ্কার করার অংশ।

video-edit-tools.py-এর "🎙️ অডিও এডিট" ট্যাব থেকে ডাকা হয়  (audio_edit.render_tab)।
আপলোড → ট্রিম (ঐচ্ছিক) → ভয়েস ক্লিনআপ → লম্বা ফাঁক ছোট করা (ঐচ্ছিক) → WAV/MP3 ডাউনলোড।
ফিল্টারগুলো voice_clean.py-তে আছে। ffmpeg ছাড়া বাড়তি কিছু লাগে না।
"""
import os
import sys
import time
import uuid
import logging
import subprocess
import tempfile
from pathlib import Path
from typing import Optional, Tuple

import streamlit as st

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import voice_clean as vc

# ── PATHS ────────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
_pf = os.path.join(BASE_DIR, "ffmpeg", "bin", "ffmpeg.exe")
_pp = os.path.join(BASE_DIR, "ffmpeg", "bin", "ffprobe.exe")
FFMPEG = _pf if os.path.exists(_pf) else "ffmpeg"
FFPROBE = _pp if os.path.exists(_pp) else "ffprobe"

WORK_DIR = os.path.join(tempfile.gettempdir(), "audio_edit_tool")
os.makedirs(WORK_DIR, exist_ok=True)

AUDIO_TYPES = ["wav", "mp3", "m4a", "aac", "ogg", "opus", "flac", "wma", "mp4", "mov", "mkv", "webm"]
FORMATS = ["WAV (সেরা মান)", "MP3 (ছোট ফাইল)"]

log = logging.getLogger("audio-edit")


# ── ছোট সাহায্যকারী ──────────────────────────────────────────────────────────
def tmp_path(stem: str, ext: str) -> str:
    return os.path.join(WORK_DIR, f"{stem}_{uuid.uuid4().hex[:10]}{ext}")


def cleanup_old(hours: float = 2.0) -> None:
    """২ ঘণ্টার পুরনো অস্থায়ী ফাইল মুছে জায়গা বাঁচায়।"""
    limit = time.time() - hours * 3600
    try:
        for name in os.listdir(WORK_DIR):
            p = os.path.join(WORK_DIR, name)
            if os.path.isfile(p) and os.path.getmtime(p) < limit:
                os.remove(p)
    except Exception as e:
        log.warning("cleanup: %s", e)


def run_ff(cmd: list, label: str) -> Tuple[bool, str]:
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=1800)
    except Exception as e:
        log.error("%s: %s", label, e)
        return False, str(e)
    if r.returncode != 0:
        err = (r.stderr or r.stdout or "অজানা ffmpeg ত্রুটি")[-1500:]
        log.error("%s ব্যর্থ: %s", label, err)
        return False, err
    return True, ""


def check_ffmpeg() -> bool:
    try:
        r = subprocess.run([FFMPEG, "-version"], capture_output=True, timeout=20)
        return r.returncode == 0
    except Exception:
        return False


def probe_duration(path: str) -> float:
    try:
        r = subprocess.run(
            [FFPROBE, "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
            capture_output=True, text=True, timeout=60,
        )
        return float((r.stdout or "0").strip().splitlines()[0])
    except Exception:
        return 0.0


def fmt_time(sec: float) -> str:
    sec = int(round(sec))
    return f"{sec // 60} মিনিট {sec % 60} সেকেন্ড"


def build_af(preset: str, nr: str, floor: float, deess: str, gap: str, loud: bool) -> str:
    """সব বাছাই মিলিয়ে ffmpeg -af ফিল্টার তৈরি। কিছু না বাছলে 'anull' (কোনো বদল নয়)।"""
    parts = []
    if preset != vc.VO_PRESETS[0]:
        parts.append(vc.build_chain(preset, nr, floor, deess, gap))
    if loud and preset != vc.VO_PRESETS[2]:      # স্টুডিও ভাইবে loudnorm আগে থেকেই আছে
        parts.append(vc.LOUDNORM)
    return vc.join(*parts) or "anull"


# ── প্রসেসিং ─────────────────────────────────────────────────────────────────
def make_preview(src: str, offset: float, af: str, secs: int = 15) -> Tuple[Optional[str], Optional[str]]:
    """নির্বাচিত জায়গা থেকে ১৫ সেকেন্ড: (আসল, প্রসেস করা) WAV।"""
    orig, proc = tmp_path("prev_orig", ".wav"), tmp_path("prev_proc", ".wav")
    base = [FFMPEG, "-y", "-ss", f"{offset:.2f}", "-t", str(secs), "-i", src, "-vn", "-ac", "1", "-ar", "44100"]
    ok1, _ = run_ff(base + [orig], "prev-orig")
    ok2, _ = run_ff(base[:-4] + ["-af", af, "-ac", "1", "-ar", "44100", proc], "prev-proc")
    if ok1 and ok2 and os.path.exists(orig) and os.path.exists(proc):
        return orig, proc
    return None, None


def process_audio(src: str, start: float, end: float, af: str, silence: str, fmt: str) -> Tuple[Optional[str], str]:
    """পুরো অডিও প্রসেস করে ফাইলের পথ ফেরত দেয়। (পথ বা None, বার্তা)"""
    cleaned = tmp_path("clean", ".wav")
    cmd = [FFMPEG, "-y"]
    if start > 0:
        cmd += ["-ss", f"{start:.2f}"]
    if end > start:
        cmd += ["-t", f"{end - start:.2f}"]
    cmd += ["-i", src, "-vn", "-af", af, "-ac", "1", "-ar", "44100", "-c:a", "pcm_s16le", cleaned]
    ok, err = run_ff(cmd, "clean")
    if not ok or not os.path.exists(cleaned):
        return None, f"ক্লিনআপ ব্যর্থ: {err[-300:]}"

    current = cleaned
    note = "ঠিক আছে"
    if silence != "বন্ধ":
        low, high = vc.measure_levels(FFMPEG, cleaned)
        sf = vc.silence_filter(silence, low, high)
        if not sf:
            note = "লম্বা ফাঁক ছোট করা হয়নি: ফাঁক আর কথার শব্দের পার্থক্য কম, তাই আলাদা করা যায়নি।"
        else:
            out_s = tmp_path("silcut", ".wav")
            ok, err = run_ff([FFMPEG, "-y", "-i", cleaned, "-af", sf, "-c:a", "pcm_s16le", out_s], "silence")
            if ok and os.path.exists(out_s):
                current = out_s
            else:
                note = "লম্বা ফাঁক ছোট করা যায়নি, বাকি প্রসেস ঠিকঠাক হয়েছে।"
                log.warning("silence: %s", err[-200:])

    if fmt == FORMATS[1]:
        out = tmp_path("final", ".mp3")
        ok, err = run_ff([FFMPEG, "-y", "-i", current, "-c:a", "libmp3lame", "-b:a", "192k", out], "mp3")
        if not ok or not os.path.exists(out):
            return None, f"MP3 বানানো যায়নি: {err[-300:]}"
        return out, note
    return current, note


# ── UI ───────────────────────────────────────────────────────────────────────
def render_tab():
    st.caption("নিজের রেকর্ড করা ভয়েস পরিষ্কার করুন: হিস কমানো, স/শ নরম করা, ফাঁকের শব্দ চাপা, ভলিউম সমান করা।")

    if not check_ffmpeg():
        st.error("FFmpeg পাওয়া যায়নি। সিস্টেমে ffmpeg ইনস্টল করুন অথবা `ffmpeg/bin/` ফোল্ডারে রাখুন।")
        return
    cleanup_old()

    up = st.file_uploader("অডিও (বা ভিডিও) ফাইল আপলোড করুন", type=AUDIO_TYPES, key="ae_upload")
    if up is None:
        st.info("৫-১০ মিনিটের রেকর্ডিং আপলোড করুন। ভিডিও দিলে শুধু তার ভয়েসটুকু নেওয়া হবে।")
        return

    key = f"{up.name}:{up.size}"
    if st.session_state.get("ae_src_key") != key:
        ext = Path(up.name).suffix.lower() or ".wav"
        p = tmp_path("in", ext)
        with open(p, "wb") as f:
            f.write(up.getbuffer())
        st.session_state.update(ae_src_key=key, ae_src_path=p, ae_src_dur=probe_duration(p))
        for k in ("ae_result", "ae_preview"):
            st.session_state.pop(k, None)
    src = st.session_state["ae_src_path"]
    dur = float(st.session_state.get("ae_src_dur", 0.0))
    max_s = dur if dur > 0 else 36000.0
    st.success(f"{up.name} — দৈর্ঘ্য: {fmt_time(dur)}" if dur > 0 else f"{up.name} লোড হয়েছে")

    # ১. ট্রিম
    st.header("১. ট্রিম (ঐচ্ছিক)")
    c1, c2 = st.columns(2)
    t_start = c1.number_input("শুরু (সেকেন্ড)", 0.0, max_s, 0.0, 0.5, key="ae_start")
    t_end = c2.number_input("শেষ (সেকেন্ড, ০ = শেষ পর্যন্ত)", 0.0, max_s, 0.0, 0.5, key="ae_end")
    if t_end and t_end <= t_start:
        st.error("শেষের সময় শুরুর চেয়ে বেশি হতে হবে।")
        return

    # ২. ক্লিনআপ
    st.header("২. ভয়েস ক্লিনআপ")
    preset = st.selectbox("ভয়েস প্রসেস", vc.VO_PRESETS, index=2, key="ae_preset")
    off = preset == vc.VO_PRESETS[0]
    a, b, c = st.columns(3)
    nr = a.selectbox("নয়েজ কমানোর মাত্রা", list(vc.NR_LEVELS.keys()), index=0, disabled=off, key="ae_nr",
                     help="পরিষ্কার জায়গায় রেকর্ড করলে 'হালকা'ই ভালো। বেশি দিলে গলা রোবটিক শোনাতে পারে।")
    deess = b.selectbox("স/শ নরম করা", list(vc.DEESS_LEVELS.keys()), index=2, disabled=off, key="ae_deess",
                        help="স, শ, ছ-এর তীক্ষ্ণ শব্দ কমায়। বেশি দিলে কিছু উচ্চারণ জড়িয়ে শোনাতে পারে।")
    gap = c.selectbox("বাক্যের ফাঁকে হিস", list(vc.GAP_LEVELS.keys()), index=2, disabled=off, key="ae_gap",
                      help="কথার ফাঁকে হিস কতটা চাপা পড়বে। পুরো নীরব হয় না, তাই স্বাভাবিক শোনায়।")
    loud = st.checkbox("ভলিউম YouTube মাপে আনা (স্টুডিও ভাইবে আগে থেকেই থাকে)", value=True, key="ae_loud")

    # ৩. ফাঁক
    st.header("৩. লম্বা ফাঁক ছোট করা (ঐচ্ছিক)")
    sil = st.selectbox("লম্বা ফাঁক ছোট করা", list(vc.SILENCE_LEVELS.keys()), index=0, key="ae_sil",
                       help="হালকা = ১ সেকেন্ডের বেশি ফাঁক, মাঝারি = ০.৭, বেশি = ০.৫ সেকেন্ডের বেশি। ফাঁক ০.৩৫ সেকেন্ডে নামে।")

    if st.session_state.get("ae_floor_key") != key:      # নয়েজ একবারই মাপা হয়, বারবার নয়
        st.session_state["ae_floor"] = vc.estimate_noise_floor(FFMPEG, src)
        st.session_state["ae_floor_key"] = key
    af = build_af(preset, nr, st.session_state["ae_floor"], deess, gap, loud)

    # প্রিভিউ
    st.header("৪. প্রিভিউ ও তৈরি")
    prev_off = st.number_input("প্রিভিউ শুরু (সেকেন্ড)", 0.0, max_s, min(t_start, max_s), 1.0, key="ae_prev_off",
                               help="যে জায়গার স/শ বা হিস পরীক্ষা করতে চান সেখান থেকে ১৫ সেকেন্ড শোনা যাবে।")
    if st.button("🎧 ১৫ সেকেন্ডের প্রিভিউ শুনুন", key="ae_prev_btn"):
        with st.spinner("প্রিভিউ বানানো হচ্ছে..."):
            st.session_state["ae_preview"] = make_preview(src, prev_off, af)
    pv = st.session_state.get("ae_preview")
    if pv:
        p_orig, p_proc = pv
        if p_orig and p_proc and os.path.exists(p_orig) and os.path.exists(p_proc):
            st.write("আসল ভয়েস")
            with open(p_orig, "rb") as f:
                st.audio(f.read(), format="audio/wav")
            st.write("প্রসেস করা ভয়েস")
            with open(p_proc, "rb") as f:
                st.audio(f.read(), format="audio/wav")
        else:
            st.error("প্রিভিউ বানানো যায়নি। টার্মিনাল লগ দেখুন।")

    fmt = st.radio("আউটপুট ফরম্যাট", FORMATS, horizontal=True, key="ae_fmt")

    if st.button("✅ পুরো অডিও প্রসেস করুন", type="primary", key="ae_run"):
        with st.spinner("প্রসেস হচ্ছে... ১০ মিনিটের অডিওতে কিছুটা সময় লাগতে পারে।"):
            t0 = time.time()
            out, msg = process_audio(src, t_start, t_end, af, sil, fmt)
        if out:
            st.session_state["ae_result"] = {
                "path": out, "fmt": fmt, "stem": Path(up.name).stem,
                "secs": time.time() - t0, "dur": probe_duration(out), "note": msg,
            }
        else:
            st.session_state.pop("ae_result", None)
            st.error(msg)

    # ফলাফল (ডাউনলোডের পরেও থাকে)
    res = st.session_state.get("ae_result")
    if res and os.path.exists(res["path"]):
        is_mp3 = res["fmt"] == FORMATS[1]
        st.success(f"তৈরি হয়েছে — দৈর্ঘ্য: {fmt_time(res['dur'])} ({res['secs']:.0f} সেকেন্ডে)")
        if res.get("note") and res["note"] != "ঠিক আছে":
            st.info(res["note"])
        with open(res["path"], "rb") as f:
            data = f.read()
        st.audio(data, format="audio/mpeg" if is_mp3 else "audio/wav")
        st.download_button(
            "⬇️ ডাউনলোড করুন", data,
            file_name=f"{res['stem']}_clean{'.mp3' if is_mp3 else '.wav'}",
            mime="audio/mpeg" if is_mp3 else "audio/wav", key="ae_download",
        )