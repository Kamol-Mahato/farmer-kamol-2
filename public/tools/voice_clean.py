"""ভয়েস ক্লিনআপের ছোট ফিল্টার-অংশ (ffmpeg -af স্ট্রিং)।

video-edit-tools.py এটা ডাকে। পরে স্লাইড ভিডিও বা অন্য টুলও একই ফাইল ব্যবহার করতে পারবে।
"""

import subprocess

VO_PRESETS = ["কোনো প্রসেস নয়", "ক্লিন (হিস কমানো)", "স্টুডিও ভাইব"]
NR_LEVELS = {"হালকা": 12, "মাঝারি": 20, "জোরালো": 30}   # নয়েজ কমানোর ডেসিবেল
LOUDNORM = "loudnorm=I=-16:TP=-1.5:LRA=11"             # YouTube/Reels মাপের ভলিউম

# স/শ নরম করার মাত্রা (deesser intensity, 0 = বন্ধ)
DEESS_LEVELS = {"বন্ধ": 0.0, "হালকা": 0.35, "মাঝারি": 0.55, "বেশি": 0.8}

# বাক্যের ফাঁকে হিস কতটা চাপা পড়বে (agate range: যত ছোট, তত বেশি চাপা)
GAP_LEVELS = {"বন্ধ": None, "হালকা": 0.35, "মাঝারি": 0.18, "বেশি": 0.08}


def deess_filter(level: str) -> str:
    """স/শ/ছ-এর তীক্ষ্ণ শব্দ নরম করে। 'বন্ধ' হলে খালি স্ট্রিং।"""
    inten = DEESS_LEVELS.get(level, 0.0)
    if inten <= 0:
        return ""
    return f"deesser=i={inten:.2f}:m=0.5:f=0.5:s=o"


def gap_filter(level: str, floor: float) -> str:
    """কথার ফাঁকে হিস চাপা দেয়, তবে পুরো নীরব করে না (স্বাভাবিক শোনায়)।
    floor = মাপা ব্যাকগ্রাউন্ড নয়েজ (dB)।"""
    rng = GAP_LEVELS.get(level)
    if rng is None:
        return ""
    thr = min(0.05, max(0.002, 10 ** ((floor + 6) / 20)))
    return f"agate=threshold={thr:.4f}:ratio=2:attack=10:release=350:range={rng}"


def join(*parts: str) -> str:
    """খালি অংশ বাদ দিয়ে ফিল্টার জোড়া লাগায়।"""
    return ",".join(p for p in parts if p)


# লম্বা ফাঁক ছোট করা: এর চেয়ে লম্বা ফাঁক (সেকেন্ড) ছোট হবে; None = বন্ধ
SILENCE_LEVELS = {"বন্ধ": None, "হালকা": 1.0, "মাঝারি": 0.7, "বেশি": 0.5}


def silence_filter(level: str, floor: float, speech: float) -> str:
    """লম্বা ফাঁকা অংশ ছোট করে (০.৩৫ সেকেন্ড রেখে), যাতে কথা জমাট শোনায়।
    floor = নীরব অংশের মাত্রা, speech = কথার অংশের মাত্রা (dB)। দুটোর পার্থক্য কম হলে
    ফাঁক ও কথা আলাদা করা যায় না, তখন খালি স্ট্রিং ফেরে (কিছু কাটা হয় না)।"""
    dur = SILENCE_LEVELS.get(level)
    if dur is None or speech - floor < 12:
        return ""
    thr = max(-60.0, min(-30.0, floor + 0.4 * (speech - floor)))
    return (f"silenceremove=start_periods=0:stop_periods=-1:stop_duration={dur}"
            f":stop_threshold={thr:.0f}dB:stop_silence=0.35")


def _rms_levels(ffmpeg: str, path: str) -> list:
    """প্রথম ৩ মিনিটের ০.১ সেকেন্ড করে RMS মাত্রা (dB), ছোট থেকে বড় সাজানো।"""
    cmd = [ffmpeg, "-v", "error", "-t", "180", "-i", path, "-vn", "-af",
           "aresample=16000,asetnsamples=n=1600:p=0,astats=metadata=1:reset=1,"
           "ametadata=print:key=lavfi.astats.Overall.RMS_level:file=-",
           "-f", "null", "-"]
    vals = []
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        for line in (r.stdout or "").splitlines():
            if "RMS_level=" in line:
                try:
                    v = float(line.split("=")[-1])
                except ValueError:
                    continue
                if v > -100:
                    vals.append(v)
    except Exception:
        pass
    vals.sort()
    return vals


def estimate_noise_floor(ffmpeg: str, path: str) -> float:
    """অডিওর সবচেয়ে নীরব অংশ মেপে ব্যাকগ্রাউন্ড নয়েজের মাত্রা (dB) বের করে।"""
    vals = _rms_levels(ffmpeg, path)
    if len(vals) >= 10:
        return max(-70.0, min(-25.0, vals[max(0, int(len(vals) * 0.10))]))
    return -45.0


def measure_levels(ffmpeg: str, path: str) -> tuple:
    """(নীরব অংশের মাত্রা, কথার অংশের মাত্রা) dB।"""
    vals = _rms_levels(ffmpeg, path)
    if len(vals) >= 10:
        return vals[int(len(vals) * 0.10)], vals[int(len(vals) * 0.90)]
    return -45.0, -45.0


def build_chain(preset: str, nr_level: str, floor: float = -45.0,
                deess: str = "বন্ধ", gap: str = "মাঝারি") -> str:
    """ভয়েসের ফিল্টার তালিকা (ffmpeg -af)। video-edit-tools.py-এর vo_chain-এর মতোই।"""
    nr = NR_LEVELS.get(nr_level, 20)
    den = f"afftdn=nr={nr}:nf={floor:.1f}:nt=w"
    if preset == VO_PRESETS[1]:
        return join("highpass=f=80", den, gap_filter(gap, floor), deess_filter(deess), "volume=1.2")
    if preset == VO_PRESETS[2]:
        return join(
            "highpass=f=80", den,
            gap_filter(gap, floor),
            "equalizer=f=250:t=q:w=1:g=-1.5",
            "equalizer=f=120:t=q:w=1:g=2",
            "equalizer=f=3000:t=q:w=1:g=2.5",
            deess_filter(deess),
            "acompressor=threshold=-20dB:ratio=3:attack=10:release=150:makeup=3",
            LOUDNORM,
        )
    return "highpass=f=80,volume=1.2"