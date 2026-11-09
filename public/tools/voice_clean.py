"""ভয়েস ক্লিনআপের ছোট ফিল্টার-অংশ (ffmpeg -af স্ট্রিং)।

video-edit-tools.py এটা ডাকে। পরে স্লাইড ভিডিও বা অন্য টুলও একই ফাইল ব্যবহার করতে পারবে।
"""

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