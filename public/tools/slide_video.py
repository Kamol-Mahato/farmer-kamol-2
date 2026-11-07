"""
প্রজ্ঞাধারা — স্লাইড ভিডিও
স্ক্রিপ্ট → ব্র্যান্ডেড স্লাইড/ছবির দৃশ্য + নিজের রেকর্ড করা ভয়েস (বা AI ভয়েস) + BG সাউন্ড → একটি MP4

video-edit-tools.py-এর "📖 স্লাইড ভিডিও" ট্যাব থেকে ডাকা হয়  (slide_video.render_tab)।
ffmpeg ও PIL ছাড়া বাড়তি কিছু লাগে না (AI ভয়েসের জন্য edge-tts)।

স্ক্রিপ্টের নিয়ম (প্রতিটি স্লাইড `---` দিয়ে আলাদা):
    @logo | @text | @shloka   স্লাইডের ধরন (না দিলে @text; @meaning থাকলে নিজে @shloka)
    @scene নাম                ছবির দৃশ্য (progyadhara_assets থেকে)
    @motion zoom-in ...       ছবির নড়াচড়া
    # লেখা                    বড় শিরোনাম
    ## লেখা                   সোনালি উপ-শিরোনাম
    - লেখা                    বুলেট
    লেখা                      সাধারণ লাইন (মাঝখানে)
    > লেখা                    ভয়েসের নোট (পর্দায় দেখাবে না)
    ~ 6                       এই ধাপ কত সেকেন্ড (ভয়েস না থাকলে)
    @meaning                  এর আগে = শ্লোকের ধাপ, এর পরে = অর্থের ধাপ
"""

import asyncio
import hashlib
import math
import os
import re
import shutil
import subprocess
import threading
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable, Dict, List, Optional, Tuple

from PIL import Image, ImageDraw, ImageFont, features

# ── ব্র্যান্ড ────────────────────────────────────────────────────────────────
INDIGO, GOLD, CREAM = "#1F2A5A", "#E0A526", "#FFF8EC"
DEFAULT_FOOTER = "ফেসবুক: প্রজ্ঞাধারা - Progyadhara   |   ইউটিউব: @progyadhara   |   লাইক  •  কমেন্ট  •  শেয়ার"

W, H, FPS = 1920, 1080, 30
FOOTER_H = 110
LEAD, TAIL = 0.35, 0.7          # ভয়েসের আগে ও পরে নীরবতা (সেকেন্ড)
MIN_SLIDE = 2.5
SILENT_DEFAULT = 4.0
FADE = 0.5
FADE_HEX = "0x1F2A5A"             # স্লাইড বদলের সময় কালোর বদলে ব্র্যান্ডের ইন্ডিগোতে ফেড

# ── শ্লোক → অর্থ ধাপ বদল ─────────────────────────────────────────────────────
TRANS = 0.9                       # শ্লোক ওপরে উঠে যেতে কত সেকেন্ড লাগবে
FADE_OUT_TEXT = 0.22              # অর্থ → ব্যাখ্যা (ও ব্যাখ্যার লাইন বদলে): পুরোনো লেখা মিলাতে কত সেকেন্ড
FADE_IN_TEXT = 0.30               # নতুন লেখা আসতে কত সেকেন্ড (বক্স একই জায়গায় স্থির থাকে)
SHLOKA_END_SCALE = 0.62           # ওপরে গিয়ে শ্লোকের প্যানেল কত ছোট হবে (১.০ = একই)
SHLOKA_END_OPACITY = 0.55         # ওপরে গিয়ে কতটা দৃশ্যমান থাকবে (১.০ = পুরো, ০.৫ = আধা-স্বচ্ছ)
SHLOKA_TOP = 36                   # ওপরে গিয়ে ওপরের কিনারা থেকে দূরত্ব (পিক্সেল)
LINE_SECS = 4.5                   # শ্লোকের প্রতি লাইন পড়তে আন্দাজি সময়
MEANING_FACTOR = 1.5              # অর্থ বুঝিয়ে বলতে পর্দার লেখার চেয়ে কত গুণ সময় লাগে (আন্দাজ)
SPLIT_PAUSE = 1.2                 # শ্লোক ও অর্থের মাঝের বিরতির আন্দাজ (সেকেন্ড)
AI_GAP = 0.6                      # AI ভয়েসে শ্লোক ও অর্থের মাঝের বিরতি

# ── মোশন: ধ্রুব গতি + নরম শুরু/শেষ ───────────────────────────────────────────
# গতি পিক্সেল/সেকেন্ড (গড়)। স্লাইড ছোট হলে ছবি কম দূরত্ব যায়, তাই কখনো দ্রুত হয় না।
MOTION_SPEEDS = {"ধীর": 16.0, "মাঝারি": 24.0, "একটু দ্রুত": 36.0}
DEFAULT_MOTION = "মাঝারি"
PAN_ZOOM = 1.30                   # প্যানের সময় ছবি কতটা বড় ধরা হয় (দূরত্বের সীমা: (১.৩-১)×১৯২০ পিক্সেল)
ZOOM_MAX = 0.12                   # জুমে সর্বোচ্চ ১২%
ZOOM_PER_SEC = 0.004              # মাঝারি গতিতে প্রতি সেকেন্ডে ০.৪%
SS = 2                            # সুপারস্যাম্পলিং: আধা-পিক্সেলের ধাপে মসৃণ নড়াচড়া
MOTION_CYCLE = ["zoom-in", "pan-right", "zoom-out", "pan-left"]   # "auto" হলে পালা করে
MOTIONS = ("auto", "zoom-in", "zoom-out", "pan-left", "pan-right", "none")
SCENE_FOLDERS = ("scenes", "symbols", "layers/backgrounds")

VOICES = {
    "Nabanita (নারী কণ্ঠ)": "bn-BD-NabanitaNeural",
    "Pradeep (পুরুষ কণ্ঠ)": "bn-BD-PradeepNeural",
}

_HERE = os.path.dirname(os.path.abspath(__file__))
_REGULAR_FONTS = [
    os.path.join(_HERE, "fonts", "HindSiliguri-Regular.ttf"),
    "/usr/share/fonts/truetype/freefont/FreeSerif.ttf",
    "/usr/share/fonts/truetype/freefont/FreeSans.ttf",
    "/usr/share/fonts/opentype/noto/NotoSansBengali-Regular.ttf",
]
_BOLD_FONTS = [os.path.join(_HERE, "fonts", "HindSiliguri-Bold.ttf")]
ASSET_DIR = os.path.normpath(os.path.join(_HERE, "..", "..", "progyadhara_assets"))
MUSIC_DIR = os.path.join(ASSET_DIR, "music")
MUSIC_EXT = (".mp3", ".wav", ".m4a", ".aac", ".ogg")
HAS_RAQM = features.check("raqm")
_LAYOUT = ImageFont.Layout.RAQM if HAS_RAQM else ImageFont.Layout.BASIC


def _first(paths):
    return next((p for p in paths if os.path.exists(p)), None)


def font_status() -> str:
    """UI-তে সতর্কতা দেখানোর জন্য: কোন ফন্ট পাওয়া গেছে।"""
    reg = _first(_REGULAR_FONTS)
    if not reg:
        return "কোনো বাংলা ফন্ট পাওয়া যায়নি। fonts/HindSiliguri-Regular.ttf রিপোতে রাখুন।"
    if "HindSiliguri" not in reg:
        return "Hind Siliguri ফন্ট পাওয়া যায়নি, বিকল্প ফন্টে আঁকা হচ্ছে (fonts/ ফোল্ডারে ফন্ট রাখলে সুন্দর হবে)।"
    return ""


def get_font(size: int, bold: bool):
    """(ফন্ট, stroke) — বোল্ড ফন্ট না থাকলে রেগুলারে stroke দিয়ে মোটা করা হয়।"""
    if bold:
        b = _first(_BOLD_FONTS)
        if b:
            return ImageFont.truetype(b, size, layout_engine=_LAYOUT), 0
    reg = _first(_REGULAR_FONTS)
    if not reg:
        return ImageFont.load_default(), 0
    return ImageFont.truetype(reg, size, layout_engine=_LAYOUT), (max(1, size // 45) if bold else 0)


_BN_DIGITS = str.maketrans("0123456789", "০১২৩৪৫৬৭৮৯")


def bn(x) -> str:
    """সংখ্যা → বাংলা অঙ্ক।"""
    return str(x).translate(_BN_DIGITS)


_EN = str.maketrans("০১২৩৪৫৬৭৮৯", "0123456789")


def _num(txt):
    """ঘরে লেখা সংখ্যা (বাংলা/ইংরেজি অঙ্ক) → float; ফাঁকা বা ভুল হলে None।"""
    try:
        v = float((txt or "").strip().translate(_EN))
        return v if v > 0 else None
    except ValueError:
        return None


def fmt_secs(sec: float) -> str:
    sec = max(0, int(round(sec)))
    if sec >= 60:
        return f"{bn(sec // 60)} মিনিট {bn(sec % 60)} সেকেন্ড"
    return f"{bn(sec)} সেকেন্ড"


# ── স্ক্রিপ্ট পার্সার ────────────────────────────────────────────────────────
@dataclass
class Slide:
    layout: str = "text"
    layout_set: bool = False
    items: list = field(default_factory=list)     # [(kind, text)] kind: h1 h2 p li   (শ্লোকের/একমাত্র ধাপ)
    voice: str = ""                               # প্রথম ধাপের ভয়েস নোট
    secs: Optional[float] = None                  # প্রথম ধাপের সেকেন্ড (~)
    scene: str = ""          # ছবির নাম (progyadhara_assets থেকে), যেমন s01_teaching
    motion: str = "auto"     # zoom-in | zoom-out | pan-left | pan-right | none | auto
    has_meaning: bool = False                     # @meaning আছে কি
    m_items: list = field(default_factory=list)   # অর্থের ধাপের লেখা
    has_bakkha: bool = False
    b_items: list = field(default_factory=list)
    b_voice: str = ""
    b_secs: Optional[float] = None
    m_voice: str = ""                             # অর্থের ধাপের ভয়েস নোট
    m_secs: Optional[float] = None                # অর্থের ধাপের সেকেন্ড (~)


def parse_script(text: str) -> List[Slide]:
    slides = []
    for block in re.split(r"(?m)^\s*-{3,}\s*$", text or ""):
        s = Slide()
        voice1, voice2, voice3 = [], [], []
        phase = 1
        for raw in block.splitlines():
            ln = raw.strip()
            if not ln or ln.startswith("//"):
                continue
            if ln.startswith("@"):
                m = re.match(r"@\s*(\w+)\s*[:：]?\s*(.*)$", ln)
                key, val = (m.group(1).lower(), m.group(2).strip()) if m else ("", "")
                if key in ("logo", "text", "shloka"):
                    s.layout, s.layout_set = key, True
                elif key == "scene":
                    s.scene = re.sub(r"\.(jpe?g|png)$", "", val, flags=re.I)
                elif key == "motion":
                    s.motion = val.lower() or "auto"
                elif key in ("meaning", "artho", "ortho"):
                    s.has_meaning = True
                    phase = 2
                elif key in ("bakkha", "bakkhoa", "bakkhya", "byakkha", "vyakkha"):
                    s.has_meaning = True
                    s.has_bakkha = True
                    phase = 3
                continue
            target_items = {1: s.items, 2: s.m_items, 3: s.b_items}[phase]
            if ln.startswith("##"):
                target_items.append(("h2", ln[2:].strip()))
            elif ln.startswith("#"):
                target_items.append(("h1", ln[1:].strip()))
            elif ln.startswith(">"):
                {1: voice1, 2: voice2, 3: voice3}[phase].append(ln[1:].strip())
            elif ln.startswith("~"):
                try:
                    val = float(ln[1:].strip())
                except ValueError:
                    continue
                if phase == 3:
                    s.b_secs = val
                elif phase == 2:
                    s.m_secs = val
                else:
                    s.secs = val
            elif ln.startswith("- "):
                target_items.append(("li", ln[2:].strip()))
            else:
                target_items.append(("p", ln))
        s.voice = " ".join(v for v in voice1 if v)
        s.m_voice = " ".join(v for v in voice2 if v)
        s.b_voice = " ".join(v for v in voice3 if v)
        if s.has_meaning and not s.layout_set:
            s.layout = "shloka"
        if s.items or s.voice or s.m_items or s.m_voice or s.b_items or s.layout == "logo" or s.scene:
            slides.append(s)
    return slides


# ── সময়ের আন্দাজ (রেকর্ডিংয়ের জন্য) ────────────────────────────────────────
def _words(txt: str) -> int:
    return len((txt or "").split())


def est_phase1(s: Slide, wpm: int) -> float:
    if s.secs:
        return float(s.secs)
    if s.has_meaning:
        lines = sum(1 for k, _ in s.items if k == "p")
        base = max(4.0, lines * LINE_SECS + 1.0)
        if s.voice:
            base = max(base, _words(s.voice) / wpm * 60.0)
        return base
    if s.voice:
        return max(MIN_SLIDE, _words(s.voice) / wpm * 60.0 + 1.0)
    return max(MIN_SLIDE, SILENT_DEFAULT)


def est_phase2(s: Slide, wpm: int) -> float:
    if not s.has_meaning or not (s.m_items or s.m_voice or s.m_secs):
        return 0.0
    if s.m_secs:
        return float(s.m_secs)
    if s.m_voice:
        return max(3.0, _words(s.m_voice) / wpm * 60.0)
    text_words = sum(_words(t) for _, t in s.m_items)
    return max(4.0, text_words / wpm * 60.0 * MEANING_FACTOR)


def est_phase3(s: Slide, wpm: int) -> float:
    if not s.has_bakkha:
        return 0.0
    if s.b_secs:
        return float(s.b_secs)
    if s.b_voice:
        return max(3.0, _words(s.b_voice) / wpm * 60.0)
    words = sum(_words(t) for _, t in s.b_items)
    return max(4.0, words / wpm * 60.0 * MEANING_FACTOR)


def est_total(s: Slide, wpm: int) -> float:
    e1, e2, e3 = est_phase1(s, wpm), est_phase2(s, wpm), est_phase3(s, wpm)
    return e1 + (SPLIT_PAUSE + e2 + e3 if s.has_meaning else 0.0)


# ── স্লাইড আঁকা ──────────────────────────────────────────────────────────────
def _mix(c1, c2, a):
    p = lambda c: tuple(int(c[i:i + 2], 16) for i in (1, 3, 5))
    a1, a2 = p(c1), p(c2)
    return tuple(int(a2[i] * a + a1[i] * (1 - a)) for i in range(3))


def logo_mark(size: int) -> Image.Image:
    """লোগো: ইন্ডিগো বৃত্ত, সোনালি সূর্য, তিন ঢেউ।"""
    S = 4
    n = size * S
    k = n / 260.0
    img = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse([0, 0, n - 1, n - 1], fill=INDIGO)
    cx, cy, r = 130 * k, 95 * k, 34 * k
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=GOLD)
    for y0, alpha in ((145, 1.0), (170, 0.85), (195, 0.65)):
        col = _mix(INDIGO, GOLD, alpha)
        pts = [((50 + i) * k, (y0 - 12.5 * math.sin(2 * math.pi * i / 80.0)) * k) for i in range(161)]
        w = int(9 * k)
        d.line(pts, fill=col, width=w, joint="curve")
        for px, py in (pts[0], pts[-1]):
            d.ellipse([px - w / 2, py - w / 2, px + w / 2, py + w / 2], fill=col)
    return img.resize((size, size), Image.LANCZOS)


def _wrap(text, font, max_w):
    lines, cur = [], ""
    for word in text.split():
        t = (cur + " " + word).strip()
        if cur and font.getlength(t) > max_w:
            lines.append(cur)
            cur = word
        else:
            cur = t
    if cur:
        lines.append(cur)
    return lines or [""]


# স্লাইডের ধরন অনুযায়ী লেখার মাপ ও রং (সাদা/ক্রিম স্লাইডে): kind → (size, color, bold)
_STYLES = {
    "text":   {"h1": (150, INDIGO, True), "h2": (108, GOLD, True), "p": (72, INDIGO, False), "li": (62, INDIGO, False)},
    "logo":   {"h1": (170, INDIGO, True), "h2": (46, GOLD, True), "p": (64, INDIGO, False), "li": (56, INDIGO, False)},
    "shloka": {"h1": (60, GOLD, True), "h2": (62, INDIGO, False), "p": (92, INDIGO, True), "li": (60, INDIGO, False)},
}


def render_slide(slide: Slide, out_png: str, footer: str = DEFAULT_FOOTER, show_footer: bool = True,
                 show_mark: bool = True) -> str:
    img = Image.new("RGB", (W, H), CREAM)
    d = ImageDraw.Draw(img)
    bottom_limit = H - (FOOTER_H + 4 if show_footer else 0) - 60
    top = 170

    if show_footer:
        d.rectangle([0, H - FOOTER_H, W, H], fill=INDIGO)
        d.rectangle([0, H - FOOTER_H - 4, W, H - FOOTER_H], fill=GOLD)
        f, _ = get_font(40, False)
        d.text((W // 2, H - FOOTER_H // 2), footer, font=f, fill=GOLD, anchor="mm")

    if slide.layout == "logo":
        m = logo_mark(360)
        img.paste(m, (W // 2 - 180, 90), m)
        top = 480
    elif show_mark:
        m = logo_mark(130)
        img.paste(m, (W - 130 - 50, 40), m)

    style = _STYLES.get(slide.layout, _STYLES["text"])
    items = []
    for kind, txt in slide.items:
        if slide.layout == "logo" and kind == "h2" and txt.isascii():
            txt = " ".join(txt)           # P R O G Y A D H A R A
        size, color, bold = style[kind]
        items.append((kind, txt, size, color, bold))

    rows = []
    for scale in (1.0, 0.92, 0.85, 0.78, 0.7, 0.62, 0.55):
        rows, total = [], 0
        for kind, txt, size, color, bold in items:
            sz = int(size * scale)
            f, sw = get_font(sz, bold)
            max_w = 1500 - (90 if kind == "li" else 0)
            lines = _wrap(txt, f, max_w)
            h = int(sz * 1.4) * len(lines)
            rows.append((kind, lines, f, sw, color, sz, h))
            total += h
        total += sum(int(r[5] * 0.3) for r in rows[:-1])
        if total <= bottom_limit - top:
            break
    else:
        total = sum(r[6] for r in rows)

    y = top + max(0, (bottom_limit - top - total) // 2)
    li_w = [f.getlength(ln) + 90 for kind, lines, f, *_ in rows if kind == "li" for ln in lines]
    x0 = int((W - max(li_w)) // 2) if li_w else 0
    for kind, lines, f, sw, color, sz, h in rows:
        for ln in lines:
            if kind == "li":
                cy = y + int(sz * 0.62)
                d.ellipse([x0 + 4, cy - 10, x0 + 24, cy + 10], fill=GOLD)
                d.text((x0 + 90, y), ln, font=f, fill=color, anchor="lt", stroke_width=sw, stroke_fill=color)
            else:
                d.text((W // 2, y), ln, font=f, fill=color, anchor="mt", stroke_width=sw, stroke_fill=color)
            y += int(sz * 1.4)
        y += int(sz * 0.3)
    img.save(out_png)
    return out_png


# ── ছবির দৃশ্য (progyadhara_assets) ──────────────────────────────────────────
class SceneError(Exception):
    pass


def list_scenes() -> dict:
    """{ফোল্ডার: [ছবির নাম, ...]} — UI-তে তালিকা দেখানোর জন্য।"""
    out = {}
    for folder in SCENE_FOLDERS:
        d = os.path.join(ASSET_DIR, *folder.split("/"))
        names = sorted(os.path.splitext(f)[0] for f in (os.listdir(d) if os.path.isdir(d) else [])
                       if f.lower().endswith((".jpg", ".jpeg", ".png")))
        if names:
            out[folder] = names
    return out


def find_scene(name: str) -> str:
    """ছবির নাম → ফাইলের পথ। না পেলে কাছাকাছি নামসহ SceneError।"""
    import difflib
    name = (name or "").strip()
    for folder in SCENE_FOLDERS:
        for ext in (".jpg", ".jpeg", ".png"):
            p = os.path.join(ASSET_DIR, *folder.split("/"), name + ext)
            if name and os.path.isfile(p):
                return p
    allnames = [n for v in list_scenes().values() for n in v]
    near = difflib.get_close_matches(name, allnames, n=3, cutoff=0.5)
    hint = f" কাছাকাছি নাম: {', '.join(near)}।" if near else ""
    if not allnames:
        hint = f" progyadhara_assets ফোল্ডারে কোনো ছবি পাওয়া যায়নি ({ASSET_DIR})।"
    raise SceneError(f"ছবি পাওয়া যায়নি: '{name}'।{hint}")


def missing_scenes(slides) -> List[str]:
    bad = []
    for s in slides:
        if s.scene:
            try:
                find_scene(s.scene)
            except SceneError:
                bad.append(s.scene)
    return bad


def list_music() -> List[str]:
    """progyadhara_assets/music/ ফোল্ডারের অডিও ফাইলের নাম।"""
    if not os.path.isdir(MUSIC_DIR):
        return []
    return sorted(f for f in os.listdir(MUSIC_DIR) if f.lower().endswith(MUSIC_EXT))


# ছবির ওপরের প্যানেলে লেখার মাপ ও রং (গাঢ় প্যানেল, তাই হালকা রং)
_LIGHT_GOLD, _PANEL_RGBA = "#F4D58D", (31, 42, 90, 214)
_SCENE_STYLES = {
    "text":   {"h1": (92, GOLD, True), "h2": (64, _LIGHT_GOLD, True), "p": (56, CREAM, False), "li": (52, CREAM, False)},
    "shloka": {"h1": (46, GOLD, True), "h2": (54, _LIGHT_GOLD, False), "p": (72, CREAM, True), "li": (52, CREAM, False)},
}
_SCENE_STYLES["logo"] = _SCENE_STYLES["text"]
_MEANING_STYLE = {"h1": (58, GOLD, True), "h2": (50, _LIGHT_GOLD, True), "p": (52, CREAM, False), "li": (48, CREAM, False)}


def _panel(items, style, pad: int = 40, max_text_w: int = 1500, max_h: int = 470,
           box: Optional[Tuple[int, int]] = None, part: str = "both") -> Optional[Image.Image]:
    """লেখার স্বচ্ছ-পটভূমির প্যানেল (RGBA)। লেখা বেশি হলে ফন্ট নিজে ছোট হয়।"""
    if not items:
        return None
    its = [(k, t, *style[k]) for k, t in items]
    rows, total = [], 0
    for scale in (1.0, 0.92, 0.85, 0.78, 0.7, 0.62, 0.55, 0.48):
        rows, total = [], 0
        for kind, txt, size, color, bold in its:
            sz = int(size * scale)
            f, sw = get_font(sz, bold)
            max_w = max_text_w - (90 if kind == "li" else 0)
            lines = _wrap(txt, f, max_w)
            rows.append((kind, lines, f, sw, color, sz, int(sz * 1.4) * len(lines)))
            total += rows[-1][6]
        total += sum(int(r[5] * 0.3) for r in rows[:-1])
        if total <= max_h - 2 * pad:
            break
    widths = [f.getlength(ln) + (90 if kind == "li" else 0) for kind, lines, f, *_ in rows for ln in lines] or [200]
    pw = int(min(W - 120, max(widths) + 2 * pad + 40))
    ph = int(total + 2 * pad)
    text_h = ph
    if box:                                    # সব প্যানেল একই মাপের বক্সে, তাই বক্স লাফায় না
        pw, ph = max(pw, box[0]), max(ph, box[1])
    img = Image.new("RGBA", (pw, ph), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if part != "text":
        d.rounded_rectangle([0, 0, pw - 1, ph - 1], radius=30, fill=_PANEL_RGBA, outline=GOLD, width=3)
    if part == "box":                          # শুধু বক্স (লেখা ছাড়া)
        return img
    y = pad + (ph - text_h) // 2               # লেখা বক্সের মাঝখানে
    for kind, lines, f, sw, color, sz, h in rows:
        for ln in lines:
            if kind == "li":
                x0 = pad + 10
                cy = y + int(sz * 0.62)
                d.ellipse([x0, cy - 9, x0 + 18, cy + 9], fill=GOLD)
                d.text((x0 + 50, y), ln, font=f, fill=color, anchor="lt", stroke_width=sw, stroke_fill=color)
            else:
                d.text((pw // 2, y), ln, font=f, fill=color, anchor="mt", stroke_width=sw, stroke_fill=color)
            y += int(sz * 1.4)
        y += int(sz * 0.3)
    return img


def _chrome_layer(footer: str, show_footer: bool, show_mark: bool) -> Image.Image:
    """নিচের বার + লোগো (স্থির স্তর, RGBA)।"""
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if show_footer:
        d.rectangle([0, H - FOOTER_H, W, H], fill=INDIGO)
        d.rectangle([0, H - FOOTER_H - 4, W, H - FOOTER_H], fill=GOLD)
        f, _ = get_font(40, False)
        d.text((W // 2, H - FOOTER_H // 2), footer, font=f, fill=GOLD, anchor="mm")
    if show_mark:
        m = logo_mark(130)
        img.paste(m, (W - 130 - 50, 40), m)
    return img


def _put(canvas: Image.Image, panel: Image.Image, cx: float, cy: float, scale: float = 1.0, opacity: float = 1.0):
    """প্যানেলটি (cx, cy) কেন্দ্র ধরে বসায়, চাইলে ছোট/আধা-স্বচ্ছ করে।"""
    p = panel
    if abs(scale - 1.0) > 1e-3:
        p = p.resize((max(1, round(p.width * scale)), max(1, round(p.height * scale))), Image.LANCZOS)
    if opacity < 0.999:
        p = p.copy()
        p.putalpha(p.getchannel("A").point(lambda v: int(v * max(0.0, opacity))))
    x = int(round(cx - p.width / 2))
    y = int(round(cy - p.height / 2))
    x, y = max(0, min(W - p.width, x)), max(0, min(H - p.height, y))
    canvas.alpha_composite(p, (x, y))


def _smooth(u: float) -> float:
    u = max(0.0, min(1.0, u))
    return u * u * (3 - 2 * u)


class SlideOverlays:
    """একটি স্লাইডের ওপরের স্তরগুলো (লেখার প্যানেল + বার + লোগো)।"""

    def __init__(self, s: Slide, footer: str, show_footer: bool, show_mark: bool):
        self.s = s
        self.base_y = H - (FOOTER_H + 4 if show_footer else 0)
        self.chrome = _chrome_layer(footer, show_footer, show_mark)
        style = _SCENE_STYLES.get(s.layout, _SCENE_STYLES["text"])
        if s.has_meaning:
            self.sh = _panel(s.items, style, max_h=560)
            heads = [(k, t) for k, t in s.b_items if k in ("h1", "h2")]
            self.bk_texts = [t for k, t in s.b_items if k in ("p", "li")]
            self.bk_items = [heads + [(k, t)] for k, t in s.b_items if k in ("p", "li")]
            first = [_panel(s.m_items, _MEANING_STYLE, max_h=400)] + \
                    [_panel(it, _MEANING_STYLE, max_h=400) for it in self.bk_items]
            sizes = [(p.width, p.height) for p in first if p is not None]
            self.box = (max(w for w, _ in sizes), max(h for _, h in sizes)) if sizes else None
            self.mp = _panel(s.m_items, _MEANING_STYLE, max_h=400, box=self.box)
            self.bk = [_panel(it, _MEANING_STYLE, max_h=400, box=self.box) for it in self.bk_items]
            self.cy_big = self.base_y * 0.47
            self.cy_small = (SHLOKA_TOP + (self.sh.height * SHLOKA_END_SCALE) / 2) if self.sh else self.cy_big
            self.cy_m = (self.base_y - 34 - self.mp.height / 2) if self.mp else 0
        else:
            self.single = _panel(s.items, style, max_h=470)

    def single_overlay(self) -> Image.Image:
        c = self.chrome.copy()
        if self.single:
            _put(c, self.single, W / 2, self.base_y - 34 - self.single.height / 2)
        return c

    def lower_layer(self, items, part: str = "both") -> Image.Image:
        """নিচের লেখা/বক্সের স্বচ্ছ স্তর। part: both | box (শুধু বক্স) | text (শুধু লেখা)।"""
        c = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        panel = _panel(items, _MEANING_STYLE, max_h=400, box=self.box, part=part)
        if panel is not None:
            _put(c, panel, W / 2, self.base_y - 34 - panel.height / 2)
        return c

    def frame(self, p: float, lower=None, show_lower: bool = True) -> Image.Image:
        """p=0 → শ্লোক মাঝখানে বড়; p=1 → শ্লোক ওপরে ছোট ও আধা-স্বচ্ছ + নিচে অর্থ।"""
        c = self.chrome.copy()
        e = _smooth(p)
        if self.sh:
            sc = 1 + (SHLOKA_END_SCALE - 1) * e
            op = 1 + (SHLOKA_END_OPACITY - 1) * e
            cy = self.cy_big + (self.cy_small - self.cy_big) * e
            _put(c, self.sh, W / 2, cy, sc, op)
        mpanel = lower if lower is not None else self.mp
        if show_lower and mpanel is not None and p > 0.0:
            me = _smooth((p - 0.3) / 0.7)
            if me > 0.0:
                cy_m = self.base_y - 34 - mpanel.height / 2
                _put(c, mpanel, W / 2, cy_m + (1 - me) * 28, 1.0, me)
        return c


def _plain_bg(out_path: str) -> str:
    """ছবি না থাকলে গাঢ় ইন্ডিগো গ্রেডিয়েন্ট পটভূমি (শ্লোক+অর্থ স্লাইডের জন্য)।"""
    if os.path.isfile(out_path):
        return out_path
    top, bot = _mix(INDIGO, "#000000", 0.0), _mix(INDIGO, "#4A5CA8", 0.55)
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    for y in range(H):
        a = y / (H - 1)
        d.line([(0, y), (W, y)], fill=tuple(int(top[i] * (1 - a) + bot[i] * a) for i in range(3)))
    img.save(out_path, quality=95)
    return out_path


def _cover_crop(src: Image.Image) -> Image.Image:
    k = max(W / src.width, H / src.height)
    src = src.resize((int(src.width * k + 0.5), int(src.height * k + 0.5)), Image.LANCZOS)
    left, top = (src.width - W) // 2, (src.height - H) // 2
    return src.crop((left, top, left + W, top + H)).convert("RGBA")


def render_scene_overlay(slide: Slide, out_png: str, footer: str = DEFAULT_FOOTER, show_footer: bool = True,
                         show_mark: bool = True) -> str:
    """একধাপের স্লাইডের জন্য ছবির ওপরে বসার স্বচ্ছ স্তর (RGBA): লেখার প্যানেল + নিচের বার + লোগো।"""
    SlideOverlays(slide, footer, show_footer, show_mark).single_overlay().save(out_png)
    return out_png


def preview_images(slide: Slide, footer: str = DEFAULT_FOOTER, show_footer: bool = True,
                   show_mark: bool = True) -> List[Tuple[str, Image.Image]]:
    """UI-র জন্য স্থির ফ্রেম: [(নাম, ছবি)]। দুই ধাপের স্লাইডে দুটো (শ্লোক ধাপ, অর্থ ধাপ)।"""
    if slide.scene:
        bg = _cover_crop(Image.open(find_scene(slide.scene)).convert("RGB"))
    elif slide.has_meaning:
        bg = _plain_bg_image()
    else:
        import tempfile
        fd, tmp = tempfile.mkstemp(suffix=".png")
        os.close(fd)
        try:
            render_slide(slide, tmp, footer, show_footer, show_mark)
            with Image.open(tmp) as im:
                return [("", im.convert("RGB").copy())]
        finally:
            try:
                os.remove(tmp)
            except OSError:
                pass
    ov = SlideOverlays(slide, footer, show_footer, show_mark)
    if slide.has_meaning:
        out = [("শ্লোকের ধাপ", Image.alpha_composite(bg, ov.frame(0.0)).convert("RGB")),
               ("অর্থের ধাপ", Image.alpha_composite(bg, ov.frame(1.0)).convert("RGB"))]
        if slide.has_bakkha and ov.bk:
            out.append(("ব্যাখ্যার ধাপ", Image.alpha_composite(bg, ov.frame(1.0, lower=ov.bk[0])).convert("RGB")))
        return out
    return [("", Image.alpha_composite(bg, ov.single_overlay()).convert("RGB"))]


def _plain_bg_image() -> Image.Image:
    import tempfile
    p = os.path.join(tempfile.gettempdir(), "progyadhara_plain_bg.jpg")
    return Image.open(_plain_bg(p)).convert("RGBA")


def render_scene_preview(slide: Slide, out_png: str, footer: str = DEFAULT_FOOTER, show_footer: bool = True,
                         show_mark: bool = True) -> str:
    """আগের নামে সুবিধার জন্য: প্রথম ফ্রেমটি ফাইলে সেভ করে।"""
    preview_images(slide, footer, show_footer, show_mark)[0][1].save(out_png)
    return out_png


# ── মোশন (ffmpeg ফিল্টার) ─────────────────────────────────────────────────────
def _motion_vf(motion: str, dur: float, idx: int, speed: float = MOTION_SPEEDS[DEFAULT_MOTION]) -> str:
    """
    ধ্রুব গতির মোশন: ছবি প্রতি সেকেন্ডে গড়ে `speed` পিক্সেল সরে (স্লাইড ছোট হলে কম দূরত্ব যায়),
    শুরু ও শেষে নরমভাবে (smoothstep) থামে। ছবি আগে ২x বড় করে তারপর ছোট করা হয়,
    তাই ধীর গতিতেও আধা-পিক্সেলের ধাপে মসৃণ, ঝাঁকুনি নেই।
    """
    m = (motion or "auto").lower()
    if m == "auto" or m not in MOTIONS:
        m = MOTION_CYCLE[idx % len(MOTION_CYCLE)]
    n = max(1, int(round(dur * FPS)))
    dur = max(dur, 0.1)

    if m == "none":
        return (f"scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos,crop={W}:{H},"
                f"format=yuv420p,loop=-1:1,trim=end_frame={n},setpts=N/{FPS}/TB")

    if m in ("pan-left", "pan-right"):
        cw, ch = int(round(W * PAN_ZOOM * SS / 2)) * 2, int(round(H * PAN_ZOOM * SS / 2)) * 2
        ow, oh = W * SS, H * SS
        max_travel = cw - ow
        travel = min(float(max_travel), speed * dur * SS)
        x_start = (max_travel - travel) / 2.0
        u = f"st(0,min(t/{dur:.4f},1));ld(0)*ld(0)*(3-2*ld(0))"
        if m == "pan-right":
            xexpr = f"{x_start:.3f}+{travel:.3f}*({u})"
        else:
            xexpr = f"{x_start:.3f}+{travel:.3f}*(1-({u}))"
        return (f"scale={cw}:{ch}:force_original_aspect_ratio=increase:flags=lanczos,crop={cw}:{ch},format=gbrp,"
                f"loop=-1:1,trim=end_frame={n},setpts=N/{FPS}/TB,"
                f"crop={ow}:{oh}:x='{xexpr}':y='(ih-oh)/2',"
                f"scale={W}:{H}:flags=bilinear,format=yuv420p")

    # zoom-in / zoom-out
    zw, zh = W * SS, H * SS
    rate = ZOOM_PER_SEC * (speed / MOTION_SPEEDS[DEFAULT_MOTION])
    amp = min(ZOOM_MAX, rate * dur)
    u = f"st(0,min(on/{n},1));ld(0)*ld(0)*(3-2*ld(0))"
    z = f"1+{amp:.5f}*({u})" if m == "zoom-in" else f"1+{amp:.5f}*(1-({u}))"
    return (f"scale={zw}:{zh}:force_original_aspect_ratio=increase:flags=lanczos,crop={zw}:{zh},format=gbrp,"
            f"loop=-1:1,trim=end_frame={n},setpts=N/{FPS}/TB,"
            f"zoompan=z='{z}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s={W}x{H}:fps={FPS},format=yuv420p")


# ── ভয়েস (edge-tts) ─────────────────────────────────────────────────────────
class TTSError(Exception):
    pass


def _run_async(coro):
    try:
        asyncio.get_running_loop()
    except RuntimeError:
        return asyncio.run(coro)
    box = {}

    def target():
        try:
            box["v"] = asyncio.run(coro)
        except BaseException as e:      # noqa
            box["e"] = e

    t = threading.Thread(target=target)
    t.start()
    t.join()
    if "e" in box:
        raise box["e"]
    return box.get("v")


def edge_synth(voice: str, rate_pct: int) -> Callable[[str, str], None]:
    def synth(text: str, out_path: str):
        try:
            import edge_tts
        except ImportError:
            raise TTSError("edge-tts ইনস্টল নেই। requirements.txt-এ `edge-tts` যোগ করুন।")

        async def go():
            await edge_tts.Communicate(text, voice, rate=f"{rate_pct:+d}%").save(out_path)

        try:
            _run_async(go())
        except Exception as e:
            raise TTSError(f"ভয়েস সার্ভার থেকে অডিও আসেনি ({type(e).__name__}: {e}). "
                           "ক্লাউড সার্ভার থেকে Microsoft এই অনুরোধ আটকে থাকতে পারে।") from e
        if not os.path.exists(out_path) or os.path.getsize(out_path) == 0:
            raise TTSError("ভয়েস ফাইল খালি এসেছে।")
    return synth


# ── অডিও বিশ্লেষণ ───────────────────────────────────────────────────────────
def _ff(cmd, what):
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=3600)
    if r.returncode != 0:
        raise RuntimeError(f"{what}: ffmpeg ব্যর্থ\n{(r.stderr or '')[-1500:]}")


def _probe(ffprobe, path) -> float:
    r = subprocess.run([ffprobe, "-v", "error", "-show_entries", "format=duration",
                        "-of", "default=noprint_wrappers=1:nokey=1", path],
                       capture_output=True, text=True, timeout=60)
    try:
        return float(r.stdout.strip())
    except ValueError:
        return 0.0


def detect_split(ffmpeg: str, audio_path: str, total: float) -> Optional[float]:
    """
    রেকর্ডিংয়ের সবচেয়ে লম্বা নীরবতার মাঝখান (অডিও শুরু থেকে সেকেন্ড) — শ্লোক শেষ, অর্থ শুরুর মাঝের বিরতি।
    শ্লোকের পর ১ সেকেন্ডের বেশি চুপ থাকলে নির্ভরযোগ্য। না পেলে None।
    """
    try:
        r = subprocess.run([ffmpeg, "-hide_banner", "-i", audio_path, "-af", "volumedetect", "-vn", "-f", "null", "-"],
                           capture_output=True, text=True, timeout=120)
        m = re.search(r"max_volume:\s*(-?[\d.]+)\s*dB", r.stderr)
        peak = float(m.group(1)) if m else -3.0
        noise = max(-45.0, min(-25.0, peak - 30.0))
        r = subprocess.run([ffmpeg, "-hide_banner", "-i", audio_path, "-af",
                            f"silencedetect=noise={noise:.1f}dB:d=0.5", "-vn", "-f", "null", "-"],
                           capture_output=True, text=True, timeout=120)
    except Exception:
        return None
    starts = [float(x) for x in re.findall(r"silence_start:\s*(-?[\d.]+)", r.stderr)]
    ends = [(float(a), float(b)) for a, b in re.findall(r"silence_end:\s*(-?[\d.]+)\s*\|\s*silence_duration:\s*([\d.]+)", r.stderr)]
    spans = []
    for k, st in enumerate(starts):
        if k < len(ends):
            en, dr = ends[k]
            spans.append((max(0.0, st), en, dr))
        else:                                   # শেষ পর্যন্ত নীরবতা — ধাপ-বদলের জন্য ধরা হয় না
            continue
    spans = [(a, b, d) for a, b, d in spans if a >= 1.0 and b <= total - 0.8]
    if not spans:
        return None
    a, b, _ = max(spans, key=lambda x: x[2])
    return (a + b) / 2.0


# ── ভিডিও তৈরি ───────────────────────────────────────────────────────────────
@dataclass
class Options:
    footer: str = DEFAULT_FOOTER
    show_footer: bool = True
    show_mark: bool = True
    voice_mode: str = "own"                                   # own = নিজের রেকর্ড, ai = AI ভয়েস, none = নীরব
    slide_audio: Dict[int, str] = field(default_factory=dict)       # স্লাইড নম্বর (০ থেকে) → ভয়েস ফাইল
    split_override: Dict[int, float] = field(default_factory=dict)  # স্লাইড নম্বর → শ্লোক শেষের সময় (সেকেন্ড)
    manual: Dict[int, tuple] = field(default_factory=dict)   # স্লাইড নম্বর → (শ্লোক, অর্থ, ব্যাখ্যা) সেকেন্ড
    motion_speed: float = MOTION_SPEEDS[DEFAULT_MOTION]
    wpm: int = 115                                            # আন্দাজের জন্য কথা বলার গতি
    music_path: Optional[str] = None                          # BG সাউন্ড ফাইল
    music_vol: float = 0.12                                   # ০.০–১.০
    duck: bool = True                                         # ভয়েসের সময় BG নিজে আরও কমবে


@dataclass
class Result:
    mp4: str
    srt: str
    voice_mp3: Optional[str]
    seconds: float


@dataclass
class Plan:
    dur: float
    tb: Optional[float] = None        # ব্যাখ্যা শুরুর সময়
    ts: Optional[float] = None                                # ট্রানজিশন শুরুর সময় (দুই ধাপের স্লাইডে)
    audio: List[Tuple[str, float]] = field(default_factory=list)    # (ফাইল, শুরুর দেরি)
    srt: List[Tuple[float, float, str]] = field(default_factory=list)


def _sentences(text: str) -> List[str]:
    parts = [p.strip() for p in re.findall(r"[^।.?!]+[।.?!]?", text) if p.strip()]
    return parts or [text]


def _srt_time(t: float) -> str:
    t = max(0.0, t)
    ms = int(round(t * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


def _clamp_ts(ts: float, dur: float) -> float:
    return max(0.5, min(ts, dur - TRANS - 0.5))


def plan_slide(i: int, s: Slide, opts: Options, ffmpeg: str, ffprobe: str, work: Path,
               synth: Optional[Callable[[str, str], None]]) -> Plan:
    plan = _plan_base(i, s, opts, ffmpeg, ffprobe, work, synth)
    if not s.has_meaning:
        return plan
    wpm = opts.wpm
    has_m = bool(s.m_items or s.m_voice or s.m_secs)
    man = opts.manual.get(i)
    if man:
        t1 = float(man[0])
        t2 = float(man[1]) if has_m else 0.0
        t3 = float(man[2]) if s.has_bakkha else 0.0
        need = max((d + _probe(ffprobe, p) for p, d in plan.audio), default=0.0)
        need = need + TAIL if need else 0.0
        total = t1 + t2 + t3
        dur = max(MIN_SLIDE, total, need)
        extra = dur - total                      # রেকর্ডিং বেশি লম্বা হলে শেষ ধাপ বাড়বে
        if s.has_bakkha:
            t3 += extra
        elif has_m:
            t2 += extra
        else:
            t1 += extra
        plan.dur = dur
        plan.ts = _clamp_ts(t1 - TRANS / 2, dur)
        if s.has_bakkha:
            plan.tb = t1 + t2
    elif s.has_bakkha:
        t1 = (plan.ts + TRANS / 2) if plan.ts is not None else est_phase1(s, wpm)
        e2, e3 = est_phase2(s, wpm), est_phase3(s, wpm)
        rest = max(1.0, plan.dur - t1)
        plan.tb = t1 + rest * (e2 / (e2 + e3) if (e2 + e3) > 0 else 0.0)
    return plan


def _plan_base(i: int, s: Slide, opts: Options, ffmpeg: str, ffprobe: str, work: Path,
               synth: Optional[Callable[[str, str], None]]) -> Plan:
    """স্লাইডের মোট সময়, ধাপ বদলের সময় আর অডিও ঠিক করে।"""
    wpm = opts.wpm
    own = opts.slide_audio.get(i)

    # ১) নিজের রেকর্ড করা ভয়েস — আসল দৈর্ঘ্যই সময় ঠিক করে
    if opts.voice_mode == "own" and own and os.path.isfile(own):
        ad = _probe(ffprobe, own)
        dur = max(MIN_SLIDE, LEAD + ad + TAIL)
        p = Plan(dur=dur, audio=[(own, LEAD)])
        if s.has_meaning:
            sp = opts.split_override.get(i) or detect_split(ffmpeg, own, ad)
            if not sp:
                e1, e2 = est_phase1(s, wpm), est_phase2(s, wpm)
                sp = ad * e1 / max(0.1, e1 + e2)
            p.ts = _clamp_ts(LEAD + sp - TRANS / 2, dur)
        return p

    # ২) AI ভয়েস
    if opts.voice_mode == "ai" and (s.voice or s.m_voice):
        if synth is None:
            raise TTSError("ভয়েস ফাংশন দেওয়া হয়নি।")
        p = Plan(dur=MIN_SLIDE)
        if s.has_meaning:
            t_end1 = LEAD + est_phase1(s, wpm)
            if s.voice:
                a = str(work / f"v{i}a.mp3")
                synth(s.voice, a)
                vd = _probe(ffprobe, a)
                p.audio.append((a, LEAD))
                p.srt += _spread(s.voice, LEAD, vd)
                t_end1 = LEAD + vd
            t_m = t_end1 + AI_GAP
            end = t_m + est_phase2(s, wpm)
            if s.m_voice:
                b = str(work / f"v{i}b.mp3")
                synth(s.m_voice, b)
                vd2 = _probe(ffprobe, b)
                p.audio.append((b, t_m))
                p.srt += _spread(s.m_voice, t_m, vd2)
                end = t_m + vd2
            p.dur = max(MIN_SLIDE, end + TAIL + est_phase3(s, wpm))
            p.ts = _clamp_ts(t_m - TRANS / 2, p.dur)
        else:
            a = str(work / f"v{i}.mp3")
            synth(s.voice, a)
            vd = _probe(ffprobe, a)
            p.audio.append((a, LEAD))
            p.srt += _spread(s.voice, LEAD, vd)
            p.dur = max(MIN_SLIDE, LEAD + vd + TAIL)
        return p

    # ৩) নীরব — `~` বা আন্দাজি সময়
    e1 = est_phase1(s, wpm)
    if s.has_meaning:
        e2 = est_phase2(s, wpm)
        dur = max(MIN_SLIDE, e1 + e2 + est_phase3(s, wpm))
        return Plan(dur=dur, ts=_clamp_ts(e1 - TRANS / 2, dur))
    return Plan(dur=max(MIN_SLIDE, e1))


def _spread(text: str, start: float, vd: float) -> List[Tuple[float, float, str]]:
    out, sents = [], _sentences(text)
    total_chars = sum(len(x) for x in sents) or 1
    cur = start
    for sent in sents:
        seg = vd * len(sent) / total_chars
        out.append((cur, cur + seg, sent))
        cur += seg
    return out


def _encode_slide(i: int, s: Slide, plan: Plan, opts: Options, ffmpeg: str, work: Path,
                  scene_path: Optional[str]) -> str:
    dur = plan.dur
    f = min(FADE, dur / 3)
    fade = (f"fade=t=in:st=0:d={f:.2f}:color={FADE_HEX},"
            f"fade=t=out:st={dur - f:.3f}:d={f:.2f}:color={FADE_HEX}")
    cmd = [ffmpeg, "-y", "-loglevel", "error"]
    fcs: List[str] = []

    if s.has_meaning:
        # দুই ধাপ: ছবি/পটভূমি + (শ্লোক মাঝখানে) → ট্রানজিশন → (শ্লোক ওপরে + অর্থ নিচে)
        bg = scene_path or _plain_bg(str(work / "plain_bg.jpg"))
        motion = s.motion if scene_path else "none"
        ov = SlideOverlays(s, opts.footer, opts.show_footer, opts.show_mark)
        pa, pc = str(work / f"s{i}_a.png"), str(work / f"s{i}_c.png")
        ov.frame(0.0).save(pa)
        ov.frame(1.0, show_lower=False).save(pc)     # শ্লোক ওপরে + বার/লোগো (নিচের বক্স ছাড়া, স্থির)
        nfr = max(2, int(round(TRANS * FPS)))
        for k in range(nfr):
            ov.frame((k + 1) / (nfr + 1)).save(str(work / f"s{i}_t{k:03d}.png"), compress_level=1)
        ts = plan.ts if plan.ts is not None else max(0.5, dur / 2)
        te = ts + nfr / FPS
        tb = plan.tb if (s.has_bakkha and plan.tb is not None) else dur
        tb = min(dur, max(tb, te + 0.5))

        # নিচের বক্স একবার বসে স্থির থাকে; ভেতরের লেখা (অর্থ → ব্যাখ্যার লাইন) বদলের সময় ক্রস-ফেড হয়
        tl = []                                      # (শুরুর সময়, লেখার তালিকা)
        if s.m_items:
            tl.append((te, s.m_items))
        if s.has_bakkha and ov.bk:
            wts = [max(1, len(t)) for t in ov.bk_texts]
            cur, span = tb, max(0.5, dur - tb)
            for it, wt in zip(ov.bk_items, wts):
                tl.append((cur, it))
                cur = cur + span * wt / sum(wts)

        cmd += ["-i", bg, "-i", pa, "-framerate", str(FPS), "-i", str(work / f"s{i}_t%03d.png"), "-i", pc]
        fcs.append(f"[0:v]{_motion_vf(motion, dur, i, opts.motion_speed)}[bg]")
        fcs.append(f"[bg][1:v]overlay=0:0:format=auto:enable='lt(t,{ts:.3f})'[o1]")
        fcs.append(f"[2:v]setpts=PTS-STARTPTS+{ts:.3f}/TB[tr]")
        fcs.append(f"[o1][tr]overlay=0:0:format=auto:enable='between(t,{ts:.3f},{te:.3f})'[o2]")
        fcs.append(f"[o2][3:v]overlay=0:0:format=auto:enable='gte(t,{te:.3f})'[o3]")
        prev, nv = "o3", 4
        if tl:
            t0b = tl[0][0]
            pbox = str(work / f"s{i}_box.png")
            ov.lower_layer(tl[0][1], "box").save(pbox)
            if t0b > te + 0.01:                      # অর্থ না থাকলে বক্সও ধীরে আসবে
                cmd += ["-loop", "1", "-framerate", str(FPS), "-t", f"{dur - t0b + 0.5:.3f}", "-i", pbox]
                fcs.append(f"[{nv}:v]format=rgba,fade=t=in:st=0:d={FADE_IN_TEXT:.3f}:alpha=1,"
                           f"setpts=PTS-STARTPTS+{t0b:.3f}/TB[bx]")
            else:
                cmd += ["-i", pbox]
                fcs.append(f"[{nv}:v]format=rgba[bx]")
            fcs.append(f"[{prev}][bx]overlay=0:0:format=auto:enable='gte(t,{t0b:.3f})'[ob]")
            prev, nv = "ob", nv + 1
            lag = 0.0                                # আগের লেখা মিলানো শুরু হলে নতুন লেখা একটু পরে আসে
            for k, (a, items) in enumerate(tl):
                last = k == len(tl) - 1
                nxt = dur if last else tl[k + 1][0]
                fi = max(0.1, min(FADE_IN_TEXT, (nxt - a) * 0.4))
                ptxt = str(work / f"s{i}_x{k}.png")
                ov.lower_layer(items, "text").save(ptxt)
                chain = ["format=rgba"]
                if k > 0 or a > te + 0.01:
                    chain.append(f"fade=t=in:st={lag:.3f}:d={fi:.3f}:alpha=1")
                if last:
                    end, length = dur, dur - a + 0.5
                else:
                    gap = nxt - a
                    xo = max(0.05, min(FADE_OUT_TEXT, gap * 0.4))
                    end, length = nxt + xo + 0.05, gap + xo + 0.2
                    chain.append(f"fade=t=out:st={gap:.3f}:d={xo:.3f}:alpha=1")
                    lag = xo * 0.8
                chain.append(f"setpts=PTS-STARTPTS+{a:.3f}/TB")
                cmd += ["-loop", "1", "-framerate", str(FPS), "-t", f"{length:.3f}", "-i", ptxt]
                fcs.append(f"[{nv}:v]{','.join(chain)}[L{k}]")
                cond = f"gte(t,{a:.3f})" if last else f"between(t,{a:.3f},{end:.3f})"
                fcs.append(f"[{prev}][L{k}]overlay=0:0:format=auto:enable='{cond}'[st{k}]")
                prev, nv = f"st{k}", nv + 1
        fcs.append(f"[{prev}]format=yuv420p,{fade}[v]")
    elif scene_path:
        png = render_scene_overlay(s, str(work / f"s{i}.png"), opts.footer, opts.show_footer, opts.show_mark)
        cmd += ["-i", scene_path, "-i", png]
        nv = 2
        fcs.append(f"[0:v]{_motion_vf(s.motion, dur, i, opts.motion_speed)}[bg]")
        fcs.append(f"[bg][1:v]overlay=0:0:format=auto,format=yuv420p,{fade}[v]")
    else:
        png = render_slide(s, str(work / f"s{i}.png"), opts.footer, opts.show_footer, opts.show_mark)
        cmd += ["-framerate", str(FPS), "-i", png]
        nv = 1
        fcs.append(f"[0:v]format=yuv420p,loop=-1:1,trim=duration={dur:.3f},setpts=PTS-STARTPTS,{fade}[v]")

    # অডিও
    if plan.audio:
        labels = []
        for k, (path, delay) in enumerate(plan.audio):
            cmd += ["-i", path]
            fcs.append(f"[{nv + k}:a]aresample=44100,aformat=sample_fmts=fltp:channel_layouts=stereo,"
                       f"adelay={int(delay * 1000)}:all=1[a{k}]")
            labels.append(f"[a{k}]")
        if len(labels) > 1:
            fcs.append(f"{''.join(labels)}amix=inputs={len(labels)}:normalize=0:duration=longest,apad[aout]")
        else:
            fcs.append(f"{labels[0]}apad[aout]")
        amap = "[aout]"
    else:
        cmd += ["-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo"]
        amap = f"{nv}:a"

    tmp, out = str(work / f"tmp{i}.mp4"), str(work / f"p{i}.mp4")
    cmd += ["-filter_complex", ";".join(fcs), "-map", "[v]", "-map", amap,
            "-t", f"{dur:.3f}", "-r", str(FPS),
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "160k", "-ar", "44100", "-ac", "2", tmp]
    _ff(cmd, f"স্লাইড {i + 1}")
    os.replace(tmp, out)
    return out


def _mix_music(ffmpeg: str, video: str, music: str, total: float, vol: float, duck: bool, out: str):
    """ভয়েসের ওপর BG সাউন্ড মেশায়: লুপ করে পুরো ভিডিও ভরে, শুরু/শেষে ফেড, চাইলে ভয়েসের সময় নিজে কমে।"""
    fo = max(0.0, total - 2.5)
    m = (f"[1:a]aresample=44100,aformat=sample_fmts=fltp:channel_layouts=stereo,volume={vol:.3f},"
         f"afade=t=in:st=0:d=2,afade=t=out:st={fo:.2f}:d=2.5[m]")
    if duck:
        fc = (m + ";[0:a]asplit=2[v1][v2];"
              "[m][v2]sidechaincompress=threshold=0.05:ratio=3:attack=40:release=900:makeup=1[md];"
              "[v1][md]amix=inputs=2:normalize=0:duration=first:dropout_transition=0[a]")
    else:
        fc = m + ";[0:a][m]amix=inputs=2:normalize=0:duration=first:dropout_transition=0[a]"
    _ff([ffmpeg, "-y", "-loglevel", "error", "-i", video, "-stream_loop", "-1", "-i", music,
         "-filter_complex", fc, "-map", "0:v:0", "-map", "[a]", "-c:v", "copy",
         "-c:a", "aac", "-b:a", "192k", "-t", f"{total:.3f}", "-movflags", "+faststart", out], "BG সাউন্ড মেশানো")


def build_video(slides: List[Slide], opts: Options, ffmpeg: str, ffprobe: str, work_dir: str,
                synth: Optional[Callable[[str, str], None]] = None,
                progress: Optional[Callable[[float, str], None]] = None) -> Result:
    work = Path(work_dir)
    work.mkdir(parents=True, exist_ok=True)
    parts, srt, audio_parts = [], [], []
    t0 = 0.0
    n = len(slides)

    for i, s in enumerate(slides):
        if progress:
            progress(i / n * 0.9, f"স্লাইড {i + 1}/{n}")
        scene_path = find_scene(s.scene) if s.scene else None
        plan = plan_slide(i, s, opts, ffmpeg, ffprobe, work, synth)
        parts.append(_encode_slide(i, s, plan, opts, ffmpeg, work, scene_path))
        for a, b, text in plan.srt:
            srt.append((t0 + a, t0 + b, text))
        if opts.voice_mode == "ai":
            audio_parts += [(p, t0 + d) for p, d in plan.audio]
        t0 += plan.dur

    if progress:
        progress(0.92, "জোড়া লাগানো হচ্ছে")
    lst = work / "list.txt"
    lst.write_text("".join(f"file '{Path(p).resolve().as_posix()}'\n" for p in parts), encoding="utf-8")
    final = str(work / "final.mp4")
    _ff([ffmpeg, "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(lst),
         "-c", "copy", "-movflags", "+faststart", final + ".tmp.mp4"], "জোড়া")
    os.replace(final + ".tmp.mp4", final)

    if opts.music_path and os.path.isfile(opts.music_path) and opts.music_vol > 0:
        if progress:
            progress(0.96, "BG সাউন্ড মেশানো হচ্ছে")
        mixed = str(work / "final_music.mp4")
        _mix_music(ffmpeg, final, opts.music_path, t0, opts.music_vol, opts.duck, mixed)
        os.replace(mixed, final)

    srt_text = "".join(f"{k}\n{_srt_time(a)} --> {_srt_time(b)}\n{t}\n\n" for k, (a, b, t) in enumerate(srt, 1))
    voice_mp3 = None
    if audio_parts:        # শুধু AI ভয়েসের ট্র্যাক আলাদা ফাইলে
        voice_mp3 = str(work / "voice-only.mp3")
        ins, fl = [], []
        for k, (p, st_) in enumerate(audio_parts):
            ins += ["-i", p]
            fl.append(f"[{k}:a]adelay={int(st_ * 1000)}:all=1[a{k}]")
        mix = "".join(f"[a{k}]" for k in range(len(audio_parts)))
        fl.append(f"{mix}amix=inputs={len(audio_parts)}:normalize=0[o]")
        try:
            _ff([ffmpeg, "-y", "-loglevel", "error", *ins, "-filter_complex", ";".join(fl),
                 "-map", "[o]", "-c:a", "libmp3lame", "-q:a", "3", voice_mp3], "ভয়েস ট্র্যাক")
        except Exception:
            voice_mp3 = None
    if progress:
        progress(1.0, "শেষ")
    return Result(final, srt_text, voice_mp3, t0)


# ── Streamlit ট্যাব ──────────────────────────────────────────────────────────
SAMPLE_SCRIPT = """\
// প্রজ্ঞাধারা — স্বাগতম ভিডিওর নমুনা। প্রতিটি স্লাইড --- দিয়ে আলাদা।
@logo
# প্রজ্ঞাধারা
## PROGYADHARA
জ্ঞানের ধারায় জীবনের পথ
~ 6

---
# স্বাগতম
## প্রজ্ঞাধারায়
জ্ঞানের ধারায় জীবনের পথ
> সবাইকে স্বাগতম প্রজ্ঞাধারায়। জ্ঞানের ধারায় জীবনের পথ, এই ভাবনা নিয়েই আমাদের যাত্রা শুরু।

---
# আমাদের যাত্রা শুরু
## শ্রীমদ্ভগবদ্গীতা দিয়ে
- ১৮টি অধ্যায়, সহজ বাংলায়
- শ্লোক  •  অর্থ  •  জীবনে প্রয়োগ
- সামনে আরও ধর্মগ্রন্থ ও জ্ঞানের আলোচনা
> আমাদের যাত্রা শুরু শ্রীমদ্ভগবদ্গীতা দিয়ে। আঠারোটি অধ্যায়, সহজ বাংলায়: শ্লোক, তার অর্থ এবং জীবনে প্রয়োগ। সামনে আরও ধর্মগ্রন্থ ও জ্ঞানের আলোচনা আসবে।

---
# জ্ঞান সবার জন্য
## সব ধর্ম ও পরিচয়ের মানুষের জন্য
এখানে লক্ষ্য শুধু জানা ও বোঝা
> প্রজ্ঞাধারা সব ধর্ম ও পরিচয়ের মানুষের জন্য। এখানে লক্ষ্য শুধু জানা ও বোঝা।

---
# পাশে থাকুন
## সাবস্ক্রাইব  •  ফলো  •  কমেন্ট
প্রজ্ঞাধারা - Progyadhara
> ভালো লাগলে চ্যানেলটি সাবস্ক্রাইব করুন, ফেসবুক পেজ ফলো করুন, আর আপনার মতামত কমেন্টে জানান।
"""

GITA_SAMPLE = """\
// গীতা ২.৪৭ — ছবিসহ নমুনা (ছবির নাম "🖼️ ছবির তালিকা" থেকে নিন)
@scene s01_teaching
@motion zoom-in
@shloka
# শ্রীমদ্ভগবদ্গীতা ২.৪৭
কর্মণ্যেবাধিকারস্তে মা ফলেষু কদাচন।
মা কর্মফলহেতুর্ভূর্মা তে সঙ্গোহস্ত্বকর্মণি॥
> শ্রীমদ্ভগবদ্গীতা, দ্বিতীয় অধ্যায়, সাতচল্লিশ নম্বর শ্লোক। কর্মণ্যেবাধিকারস্তে মা ফলেষু কদাচন। মা কর্মফলহেতুর্ভূর্মা তে সঙ্গোহস্ত্বকর্মণি।

---
@scene s10_krishna_closeup
@motion pan-right
## অর্থ
কাজ করাতেই তোমার অধিকার, ফলে কখনোই নয়।
> এর অর্থ: কাজ করাতেই তোমার অধিকার, কাজের ফলে কখনোই নয়। ফলের আশায় কাজ কোরো না, আবার কাজ না করার দিকেও যেয়ো না।

---
@scene s12_dusk_teaching
@motion zoom-out
- কাজ আমাদের হাতে
- ফল পুরোপুরি আমাদের হাতে নয়
- তাই মন দিয়ে কাজই আমাদের দায়িত্ব
> আমরা কাজ করতে পারি, কিন্তু ফল পুরোপুরি আমাদের হাতে থাকে না। তাই মন দিয়ে কাজ করাই আমাদের দায়িত্ব।

---
@scene s05_victory
@motion zoom-in
# প্রজ্ঞাধারা
## জ্ঞানের ধারায় জীবনের পথ
> ভালো লাগলে চ্যানেলটি সাবস্ক্রাইব করুন, আর আপনার মতামত কমেন্টে জানান।
"""

GITA_MEANING_SAMPLE = """\
// গীতা ১ম অধ্যায় — শ্লোক + অর্থ + ব্যাখ্যা (নতুন ফরম্যাট)
@scene s02_chariot_armies
@motion pan-right
# শ্লোক ১.৮
ভবান্ ভীষ্মশ্চ কর্ণশ্চ কৃপশ্চ সমিতিঞ্জয়ঃ।
অশ্বত্থামা বিকর্ণশ্চ সৌমদত্তিস্তথৈব চ॥
~ 8
@meaning
## অর্থ
আপনি, ভীষ্ম, কর্ণ এবং যুদ্ধজয়ী কৃপ; অশ্বত্থামা, বিকর্ণ এবং সোমদত্তের পুত্র ভূরিশ্রবা।
> দুর্যোধন এবার নিজেদের পক্ষের প্রধান বীরদের নাম বলছেন।
~ 12
@bakkha
## ব্যাখ্যা
দুর্যোধন প্রথমে দ্রোণাচার্যের নাম নিয়েছেন, তারপর ভীষ্ম ও কর্ণের।
এঁরা সবাই কৌরব পক্ষের সবচেয়ে অভিজ্ঞ ও শক্তিশালী যোদ্ধা।
এই তালিকা শুনিয়ে দুর্যোধন নিজের পক্ষের শক্তি বোঝাতে চাইছেন।
~ 15

---
@scene s10_krishna_closeup
@motion zoom-in
# শ্লোক ১.৯
অন্যে চ বহবঃ শূরা মদর্থে ত্যক্তজীবিতাঃ।
নানাশস্ত্রপ্রহরণাঃ সর্বে যুদ্ধবিশারদাঃ॥
~ 8
@meaning
## অর্থ
আরও বহু বীর আছেন, যাঁরা আমার জন্য জীবন ত্যাগ করতেও প্রস্তুত। তাঁরা নানা অস্ত্রে সজ্জিত এবং সবাই যুদ্ধে নিপুণ।
> নামের তালিকার পর দুর্যোধন বাকি সৈন্যদের কথা বলছেন।
~ 12
@bakkha
## ব্যাখ্যা
নাম বলা বীরদের বাইরেও অনেক যোদ্ধা দুর্যোধনের পক্ষে আছেন।
তাঁরা তাঁর জন্য প্রাণ দিতেও রাজি, এটা দুর্যোধনের আত্মবিশ্বাসের কারণ।
তবু এই বাড়তি জোর দেওয়ায় ভেতরের অস্থিরতাও কিছুটা ধরা পড়ে।
~ 15
"""

SAMPLES = {
    "গীতা — শ্লোক + অর্থ (দুই ধাপ, নতুন)": GITA_MEANING_SAMPLE,
    "স্বাগতম ভিডিও (সাদা স্লাইড)": SAMPLE_SCRIPT,
    "গীতা ২.৪৭ (ছবিসহ)": GITA_SAMPLE,
}

HELP_TEXT = """
**প্রতিটি স্লাইড `---` দিয়ে আলাদা করুন।** গীতার জন্য: একটি শ্লোক = একটি স্লাইড।

| লিখুন | মানে |
|---|---|
| `@scene s01_teaching` | **ছবির দৃশ্য** (progyadhara_assets ফোল্ডার থেকে, নামে `.jpg` লাগবে না) |
| `@motion zoom-in` | ছবির নড়াচড়া: `zoom-in`, `zoom-out`, `pan-left`, `pan-right`, `none`। না দিলে পালা করে নিজে বাছে |
| `# লেখা` | বড় শিরোনাম (শ্লোকের ধাপে শ্লোকের নম্বর/নাম, যেমন `# শ্লোক ১.৬`) |
| `## লেখা` | সোনালি উপ-শিরোনাম (অর্থের ধাপে `## অর্থ`) |
| `লেখা` | সাধারণ লাইন। শ্লোকের প্রতিটি লাইন আলাদা লাইনে লিখুন |
| `- লেখা` | বুলেট |
| `@meaning` | **এর আগে = শ্লোক** (পর্দার মাঝখানে বড়), **এর পরে = অর্থ**। শ্লোক বলা শেষ হলে শ্লোক ওপরে উঠে ছোট ও আধা-স্বচ্ছ হয়ে যায়, নিচে অর্থ আসে |
| `> লেখা` | **আপনার বলার নোট** (পর্দায় আসবে না)। প্রিভিউয়ের বক্সে রেকর্ড করার সময় দেখা যাবে |
| `~ 8` | ওই ধাপ কত সেকেন্ড (শ্লোকের `~` @meaning-এর আগে, অর্থের `~` @meaning-এর পরে লিখুন)। প্রিভিউয়ের সময়ের আন্দাজ ঠিক করতে কাজে লাগে |
| `@logo` / `@text` / `@shloka` | সাদা স্লাইডের ধরন (ছবি ছাড়া) |
| `@bakkha` | **ব্যাখ্যার ধাপ** (`@meaning`-এর পরে লিখুন)। প্রতিটি সাধারণ লাইন অর্থের বক্সের জায়গায় একটার পর একটা আসবে |
| `// লেখা` | মন্তব্য (বাদ যাবে) |

**ভয়েস রেকর্ডিংয়ের নিয়ম (নিজের ভয়েস):** প্রতি স্লাইডের জন্য একটি ফাইল। শ্লোক পড়ার পর **প্রায় ১.৫ সেকেন্ড চুপ থাকুন**, তারপর অর্থ বলুন। ওই নীরবতা দেখেই কোড ঠিক করে কখন শ্লোক ওপরে উঠবে। ঠিক না ধরলে প্রিভিউয়ের বক্সে সময় নিজে লিখে দিতে পারবেন।
"""


def _wide(fn, *a, **kw):
    """Streamlit-এর নতুন/পুরোনো সংস্করণে একই কাজ করে (পুরো প্রস্থ)।"""
    try:
        return fn(*a, width="stretch", **kw)
    except Exception:
        return fn(*a, use_container_width=True, **kw)


def _slide_key(s: Slide, footer: str, sf: bool, sm: bool) -> str:
    return hashlib.md5(repr((s, footer, sf, sm)).encode("utf-8")).hexdigest()[:16]


def build_play_video(s: Slide, footer: str, show_footer: bool, show_mark: bool, voice_mode: str,
                     manual_t: Optional[tuple], audio_path: Optional[str], split: Optional[float],
                     motion_speed: float, wpm: int, ffmpeg: str, ffprobe: str, temp_dir: str,
                     synth, idx: int) -> Tuple[str, float]:
    """একটি স্লাইড আপনার দেওয়া সময় (ভয়েস দেওয়া থাকলে ভয়েসের দৈর্ঘ্য) ধরে ছোট ভিডিও করে — আসল সময়ের প্রিভিউ।"""
    one = Options(
        footer=footer, show_footer=show_footer, show_mark=show_mark, voice_mode=voice_mode,
        slide_audio={0: audio_path} if audio_path else {},
        split_override={0: float(split)} if split else {},
        manual={0: tuple(manual_t)} if manual_t else {},
        motion_speed=motion_speed, wpm=wpm,
    )
    wdir = os.path.join(temp_dir, f"play_{idx}_{int(time.time())}")
    try:
        res = build_video([s], one, ffmpeg, ffprobe, wdir, synth)
        Path(temp_dir).mkdir(parents=True, exist_ok=True)
        out = os.path.join(temp_dir, f"play_{idx}.mp4")
        shutil.copy(res.mp4, out)
        return out, res.seconds
    finally:
        shutil.rmtree(wdir, ignore_errors=True)


def render_tab(ffmpeg: str, ffprobe: str, temp_dir: str, output_dir: str):
    import streamlit as st

    st.header("📖 স্লাইড ভিডিও (শ্লোক + অর্থ + আপনার ভয়েস)")
    st.caption("স্ক্রিপ্ট লিখুন → প্রিভিউয়ে প্রতি স্লাইডের সময় দেখে ভয়েস রেকর্ড করুন → প্রতি স্লাইডে ভয়েস দিন → BG সাউন্ডসহ ভিডিও।")
    warn = font_status()
    if warn:
        st.warning(warn)
    if not HAS_RAQM:
        st.warning("বাংলা যুক্তাক্ষর ঠিকমতো বসাতে `packages.txt`-এ `libraqm0` ও `libfribidi0` লাগবে।")

    with st.expander("স্ক্রিপ্ট লেখার নিয়ম"):
        st.markdown(HELP_TEXT)

    scenes = list_scenes()
    with st.expander("🖼️ ছবির তালিকা (@scene-এ এই নামগুলো লিখুন)"):
        if not scenes:
            st.warning(f"progyadhara_assets ফোল্ডারে কোনো ছবি পাওয়া যায়নি: {ASSET_DIR}")
        for folder, names in scenes.items():
            st.markdown(f"**{folder}/**")
            st.code("\n".join(names), language=None)

    def _load_sample():
        st.session_state["sv_script"] = SAMPLES[st.session_state["sv_sample"]]

    st.selectbox("নমুনা স্ক্রিপ্ট (বাছলে নিচের লেখা বদলে যাবে)", list(SAMPLES.keys()), key="sv_sample",
                 on_change=_load_sample)
    st.session_state.setdefault("sv_script", GITA_MEANING_SAMPLE)
    script = st.text_area("স্ক্রিপ্ট", height=420, key="sv_script")
    slides = parse_script(script)
    n_scene = sum(1 for s in slides if s.scene)
    n_two = sum(1 for s in slides if s.has_meaning)
    st.caption(f"{len(slides)} টি স্লাইড · শ্লোক+অর্থ (দুই ধাপ) {n_two} টি · ছবির দৃশ্য {n_scene} টিতে")
    bad = missing_scenes(slides)
    if bad:
        st.error("এই ছবিগুলো পাওয়া যায়নি (নাম মিলিয়ে নিন): " + ", ".join(sorted(set(bad))))

    # ── ভয়েস ──
    st.markdown("#### ভয়েস")
    mode_map = {
        "নিজের রেকর্ড করা (প্রতি স্লাইডে আলাদা ফাইল)": "own",
        "AI ভয়েস (edge-tts)": "ai",
        "নীরব (শুধু দেখার জন্য)": "none",
    }
    mode_label = st.radio(
        "ভয়েস কোথা থেকে আসবে?", list(mode_map.keys()),
        horizontal=True, key="sv_voice_mode",
        help="নিজের ভয়েসে: নিচের প্রিভিউয়ে প্রতি স্লাইডের পাশে ফাইল দিন। ফাইলের আসল দৈর্ঘ্যই স্লাইডের সময় ঠিক করবে।")
    voice_mode = mode_map[mode_label]
    voice_label = list(VOICES.keys())[0]
    rate = -5
    c1, c2 = st.columns(2)
    with c1:
        wpm = st.slider("আমার কথা বলার গতি (শব্দ/মিনিট) — শুধু সময়ের আন্দাজের জন্য", 70, 170, 115, 5, key="sv_wpm",
                        help="ধীরে বললে কম, দ্রুত বললে বেশি। প্রিভিউর বক্সের আন্দাজি সময় এর ওপর নির্ভর করে।")
    with c2:
        speed_label = st.select_slider("ছবির মোশনের গতি", list(MOTION_SPEEDS.keys()), value=DEFAULT_MOTION,
                                       key="sv_motion_speed",
                                       help="ছবি কত ধীরে সরবে। স্লাইড ছোট হলে ছবি কম দূরত্ব যায়, তাই কখনো হঠাৎ দ্রুত হয় না।")
    if voice_mode == "ai":
        a1, a2 = st.columns(2)
        with a1:
            voice_label = st.selectbox("কণ্ঠ", list(VOICES.keys()), key="sv_voice")
        with a2:
            rate = st.slider("কথার গতি (%)", -30, 15, -5, 5, key="sv_rate", help="নেগেটিভ মানে ধীরে পড়বে।")
    synth = edge_synth(VOICES[voice_label], rate) if voice_mode == "ai" else None

    # ── BG সাউন্ড ──
    st.markdown("#### 🎵 ব্যাকগ্রাউন্ড সাউন্ড")
    music_files = list_music()
    opts_music = ["কোনো BG সাউন্ড নয়"] + music_files + ["অন্য ফাইল আপলোড করব"]
    pick = st.selectbox(f"BG সাউন্ড বাছুন (ফোল্ডার: progyadhara_assets/music/ — {len(music_files)} টি ফাইল)",
                        opts_music, index=1 if music_files else 0, key="sv_music_pick")
    music_path = None
    if pick == "অন্য ফাইল আপলোড করব":
        mup = st.file_uploader("BG সাউন্ড ফাইল (MP3 / WAV / M4A)", type=["mp3", "wav", "m4a", "aac", "ogg"], key="sv_music_up")
        if mup:
            Path(temp_dir).mkdir(parents=True, exist_ok=True)
            music_path = os.path.join(
                temp_dir, f"bg_{hashlib.md5(mup.name.encode('utf-8')).hexdigest()[:8]}{Path(mup.name).suffix}")
            with open(music_path, "wb") as fh:
                fh.write(mup.getbuffer())
    elif pick != "কোনো BG সাউন্ড নয়":
        music_path = os.path.join(MUSIC_DIR, pick)
    if music_path:
        m1, m2 = st.columns([2, 1])
        with m1:
            vol_pct = st.slider("BG সাউন্ডের আওয়াজ (%) — কম = ভয়েস পরিষ্কার", 1, 60, 12, 1, key="sv_music_vol")
        with m2:
            duck = st.checkbox("ভয়েসের সময় BG নিজে আরও কমবে", value=True, key="sv_duck",
                               help="আপনি যখন কথা বলবেন BG ধীরে নেমে যাবে, থামলে আবার উঠবে।")
        try:
            with open(music_path, "rb") as fh:
                st.audio(fh.read())
        except OSError:
            pass
    else:
        vol_pct, duck = 12, True

    d1, d2 = st.columns([1, 3])
    with d1:
        show_footer = st.checkbox("নিচের বার", value=True, key="sv_footer_on")
        show_mark = st.checkbox("উপরে ডানে লোগো", value=True, key="sv_mark")
    with d2:
        footer = st.text_input("নিচের বারের লেখা", value=DEFAULT_FOOTER, key="sv_footer")
    name = st.text_input("ফাইলের নাম", value="progyadhara-video", key="sv_name")

    # ── প্রিভিউ + প্রতি স্লাইডের ভয়েস ──
    st.markdown("#### 👀 প্রিভিউ ও ভয়েস")
    b1, b2 = st.columns(2)
    with b1:
        if _wide(st.button, "👀 স্লাইডগুলো দেখুন (ভয়েস ছাড়া, দ্রুত)", key="sv_prev"):
            st.session_state["sv_prev_on"] = True
    with b2:
        if voice_mode == "ai":
            first = next((s.voice or s.m_voice for s in slides if s.voice or s.m_voice), "")
            if _wide(st.button, "🎧 প্রথম ভয়েসটা শুনে দেখুন", key="sv_hear", disabled=not first):
                try:
                    Path(temp_dir).mkdir(parents=True, exist_ok=True)
                    p = os.path.join(temp_dir, "voice_preview.mp3")
                    synth(first, p)
                    with open(p, "rb") as fh:
                        st.audio(fh.read(), format="audio/mp3")
                except TTSError as e:
                    st.error(str(e))

    audio_store = st.session_state.setdefault("sv_audio", {})
    split_override: Dict[int, float] = {}
    manual: Dict[int, tuple] = {}
    if st.session_state.get("sv_prev_on") and slides:
        pdir = os.path.join(temp_dir, "slide_preview")
        Path(pdir).mkdir(parents=True, exist_ok=True)
        if voice_mode == "own":
            st.info("প্রতিটি স্লাইডের ডানের বক্সে লেখা সময় ধরে অন্য ডিভাইসে রেকর্ড করুন, তারপর ওই স্লাইডের বক্সে ফাইল দিন। "
                    "শ্লোকের পর প্রায় ১.৫ সেকেন্ড চুপ থাকবেন। স্লাইডের ক্রম বদলালে বা ভয়েসের ধরন বদলালে ভয়েস আবার দিতে হবে। "
                    "ভিডিও তৈরির সময় পাতা বন্ধ করবেন না।")
        total_est = 0.0
        prev_eff = [None, None, None]        # আগের স্লাইডের শ্লোক/অর্থ/ব্যাখ্যার সময় (পরেরটা এখান থেকে নেবে)
        for i, s in enumerate(slides):
            st.divider()
            left, right = st.columns([3, 2])
            with left:
                try:
                    key = _slide_key(s, footer, show_footer, show_mark)
                    paths = []
                    probe_p = os.path.join(pdir, f"{key}_0.png")
                    if not os.path.isfile(probe_p):
                        for k, (label, im) in enumerate(preview_images(s, footer, show_footer, show_mark)):
                            im.save(os.path.join(pdir, f"{key}_{k}.png"))
                    k = 0
                    while os.path.isfile(os.path.join(pdir, f"{key}_{k}.png")):
                        paths.append(os.path.join(pdir, f"{key}_{k}.png"))
                        k += 1
                    cap = f"স্লাইড {bn(i + 1)}" + (f" · ছবি: {s.scene} · মোশন: {s.motion}" if s.scene else "")
                    if len(paths) > 1:
                        tabs = st.tabs(["শ্লোকের ধাপ", "অর্থের ধাপ", "ব্যাখ্যার ধাপ"][:len(paths)])
                        for tb, pth in zip(tabs, paths):
                            with tb:
                                _wide(st.image, pth)
                    else:
                        _wide(st.image, paths[0])
                    st.caption(cap)
                except SceneError as e:
                    st.error(f"স্লাইড {i + 1}: {e}")
            with right:
                with st.container(border=True):
                    e1, e2 = est_phase1(s, wpm), est_phase2(s, wpm)
                    est = est_total(s, wpm)
                    st.markdown(f"**স্লাইড {bn(i + 1)}**")
                    st.markdown(f"### ⏱ ~{bn(int(round(est)))} সেকেন্ড")
                    if s.has_meaning:
                        st.caption(f"শ্লোক ≈ {bn(int(round(e1)))} সে.  +  বিরতি ≈ {bn(SPLIT_PAUSE)} সে.  +  অর্থ ≈ {bn(int(round(e2)))} সে.")
                    else:
                        st.caption("একধাপের স্লাইড")
                    st.caption("এটা আন্দাজ। রেকর্ডিংয়ের আসল দৈর্ঘ্যই ভিডিওতে ধরা হবে।")
                    mlen = None
                    st.caption(f"▶ ভিডিওতে এই স্লাইড শুরু হবে: {fmt_secs(total_est)}-এ")
                    if s.has_meaning:
                        has_m = bool(s.m_items or s.m_voice or s.m_secs)
                        est_k = [e1, e2, est_phase3(s, wpm)]
                        present = [True, has_m, s.has_bakkha]
                        names = ["শ্লোক (সে.)", "অর্থ (সে.)", "ব্যাখ্যা (সে.)"]
                        tcols = st.columns(3)
                        eff, active = [], False
                        for k in range(3):
                            if not present[k]:
                                eff.append(0.0)
                                continue
                            dflt = prev_eff[k] if prev_eff[k] is not None else round(est_k[k])
                            with tcols[k]:
                                raw = st.text_input(names[k], value="", placeholder=bn(int(dflt)),
                                                    key=f"sv_t{k}_{i}",
                                                    help="ফাঁকা রাখলে আগের স্লাইডের সময়ই বসবে। বদলালে পরের স্লাইডগুলোও এটাই নেবে।")
                            typed = _num(raw)
                            v = typed if typed is not None else dflt
                            if typed is not None or prev_eff[k] is not None:
                                active = True
                                prev_eff[k] = v
                            eff.append(v)
                        if active:
                            manual[i] = tuple(eff)
                            mlen = sum(eff)
                            st.caption(f"আপনার সময়ে এই স্লাইড: **{fmt_secs(mlen)}**")
                    # ▶ এই স্লাইড আসল সময়ে (আপনার দেওয়া সময়/ভয়েস ধরে) চালিয়ে দেখা
                    pm = manual.get(i)
                    pa_ = audio_store.get(i) if voice_mode == "own" else None
                    pa_path = pa_["path"] if (pa_ and os.path.isfile(pa_["path"])) else None
                    p_split = st.session_state.get(f"sv_split_{i}") or None
                    pkey = repr((_slide_key(s, footer, show_footer, show_mark), pm, pa_path, p_split,
                                 speed_label, wpm, voice_mode))
                    if _wide(st.button, "▶ আসল সময়ে দেখুন", key=f"sv_play_{i}",
                             help="এই স্লাইডটা আপনার দেওয়া সময় ধরে ছোট ভিডিও করে চালাবে (ভয়েস দেওয়া থাকলে ভয়েসসহ)।"):
                        with st.spinner("এই স্লাইডের ভিডিও বানানো হচ্ছে... স্লাইডের দৈর্ঘ্যের কাছাকাছি সময় লাগতে পারে।"):
                            try:
                                outp, psecs = build_play_video(
                                    s, footer, show_footer, show_mark, voice_mode, pm, pa_path, p_split,
                                    MOTION_SPEEDS[speed_label], wpm, ffmpeg, ffprobe, temp_dir, synth, i)
                                st.session_state.setdefault("sv_play", {})[i] = {
                                    "key": pkey, "path": outp, "secs": psecs}
                            except TTSError as e:
                                st.error(f"ভয়েস বানানো যায়নি: {e}")
                            except Exception as e:
                                st.error(f"প্রিভিউ বানাতে সমস্যা: {e}")
                    pl = st.session_state.get("sv_play", {}).get(i)
                    if pl and pl["key"] == pkey and os.path.isfile(pl["path"]):
                        st.video(pl["path"])
                        st.caption(f"এই স্লাইড ভিডিওতে চলবে: {fmt_secs(pl['secs'])}")
                    if s.voice:
                        st.markdown("**বলার নোট (শ্লোক):** " + s.voice)
                    if s.m_voice:
                        st.markdown("**বলার নোট (অর্থ):** " + s.m_voice)
                    if voice_mode == "own":
                        up = st.file_uploader("এই স্লাইডের ভয়েস", type=["mp3", "wav", "m4a", "aac", "ogg"],
                                              key=f"sv_up_{i}")
                        info = _handle_upload(i, up, temp_dir, ffmpeg, ffprobe, s.has_meaning)
                        if info:
                            with open(info["path"], "rb") as fh:
                                st.audio(fh.read())
                            line = f"আসল দৈর্ঘ্য: **{bn(round(info['dur'], 1))} সে.**"
                            if s.has_meaning:
                                if info.get("split"):
                                    line += f" · শ্লোক শেষ ≈ **{bn(round(info['split'], 1))} সে.** (নীরবতা দেখে ধরা)"
                                else:
                                    line += " · ⚠️ মাঝে নীরবতা পাওয়া যায়নি, সময়ের অনুপাতে ধরা হবে"
                            st.markdown(line)
                            if s.has_meaning:
                                ov = st.number_input("শ্লোক শেষ হওয়ার সময় নিজে দিন (সে.) — ০ মানে নিজে ধরবে",
                                                     min_value=0.0, max_value=float(max(1.0, info["dur"])),
                                                     value=0.0, step=0.1, key=f"sv_split_{i}")
                                if ov > 0:
                                    split_override[i] = float(ov)
                            total_est += max(info["dur"] + LEAD + TAIL, mlen or 0.0)
                            continue
                    total_est += mlen if mlen else est
        st.success(f"সব স্লাইড মিলিয়ে মোট প্রায় {fmt_secs(total_est)} "
                   "(যে স্লাইডে ভয়েস দেওয়া হয়েছে তার আসল দৈর্ঘ্য, বাকিগুলোর আন্দাজ)")

    slide_audio = {i: v["path"] for i, v in audio_store.items() if i < len(slides) and os.path.isfile(v["path"])}
    if voice_mode == "own" and slides:
        missing = [i + 1 for i in range(len(slides)) if i not in slide_audio]
        if slide_audio and missing:
            st.warning("এই স্লাইডগুলোতে ভয়েস দেওয়া হয়নি, ওগুলো নীরব থাকবে: " + ", ".join(bn(x) for x in missing))

    opts = Options(
        footer=footer, show_footer=show_footer, show_mark=show_mark,
        voice_mode=voice_mode,
        slide_audio=slide_audio if voice_mode == "own" else {},
        split_override=split_override,
        manual=manual,
        motion_speed=MOTION_SPEEDS[speed_label],
        wpm=wpm,
        music_path=music_path, music_vol=vol_pct / 100.0, duck=duck,
    )

    if _wide(st.button, "🎬 ভিডিও তৈরি করুন", type="primary", key="sv_build"):
        if not slides:
            st.error("স্ক্রিপ্ট খালি।")
        else:
            bar = st.progress(0.0)
            status = st.empty()
            work = os.path.join(temp_dir, f"slides_{int(time.time())}")
            try:
                res = build_video(slides, opts, ffmpeg, ffprobe, work, synth,
                                  progress=lambda p, m: (bar.progress(min(1.0, p)), status.write(m)))
                Path(output_dir).mkdir(parents=True, exist_ok=True)
                stamp = time.strftime("%Y%m%d_%H%M%S")
                safe = re.sub(r"[^\w\-]+", "_", name).strip("_") or "progyadhara-video"
                final = os.path.join(output_dir, f"{safe}_{stamp}.mp4")
                shutil.copy(res.mp4, final)
                mp3_bytes = None
                if res.voice_mp3:
                    with open(res.voice_mp3, "rb") as fh:
                        mp3_bytes = fh.read()
                st.session_state["sv_result"] = {
                    "path": final, "srt": res.srt, "mp3": mp3_bytes,
                    "name": safe, "secs": res.seconds,
                }
                status.write("✅ শেষ")
            except TTSError as e:
                bar.empty()
                st.error(f"ভয়েস বানানো যায়নি: {e}")
                st.info("উপায়: নিজের রেকর্ড করা ভয়েস ব্যবহার করুন, অথবা \"নীরব\" বেছে ভিডিও বানিয়ে নিন।")
            except Exception as e:
                bar.empty()
                st.error(f"ভিডিও বানাতে সমস্যা: {e}")
            finally:
                shutil.rmtree(work, ignore_errors=True)

    r = st.session_state.get("sv_result")
    if r and os.path.isfile(r["path"]):
        st.success(f"তৈরি: প্রায় {fmt_secs(r['secs'])}")
        st.video(r["path"])
        k1, k2, k3 = st.columns(3)
        with open(r["path"], "rb") as fh:
            k1.download_button("⬇️ ভিডিও (MP4)", fh.read(), file_name=f"{r['name']}.mp4", mime="video/mp4", key="sv_dl1")
        if r["srt"]:
            k2.download_button("⬇️ সাবটাইটেল (SRT)", r["srt"].encode("utf-8"), file_name=f"{r['name']}.srt",
                               mime="text/plain", key="sv_dl2")
        if r["mp3"]:
            k3.download_button("⬇️ শুধু ভয়েস (MP3)", r["mp3"], file_name=f"{r['name']}-voice.mp3",
                               mime="audio/mpeg", key="sv_dl3")


def _handle_upload(i: int, up, temp_dir: str, ffmpeg: str, ffprobe: str, need_split: bool) -> Optional[dict]:
    """স্লাইডের আপলোড করা ভয়েস ডিস্কে রাখে, দৈর্ঘ্য ও শ্লোক-শেষের সময় বের করে (session-এ মনে রাখে)।"""
    import streamlit as st
    store = st.session_state.setdefault("sv_audio", {})
    if up is None:
        store.pop(i, None)
        return None
    fid = getattr(up, "file_id", None) or (up.name, up.size)
    cur = store.get(i)
    if cur and cur["id"] == fid and os.path.isfile(cur["path"]):
        return cur
    adir = os.path.join(temp_dir, "sv_audio")
    Path(adir).mkdir(parents=True, exist_ok=True)
    path = os.path.join(adir, f"slide_{i}_{int(time.time() * 1000)}{Path(up.name).suffix}")
    with open(path, "wb") as fh:
        fh.write(up.getbuffer())
    dur = _probe(ffprobe, path)
    split = detect_split(ffmpeg, path, dur) if need_split else None
    store[i] = {"id": fid, "path": path, "dur": dur, "split": split, "name": up.name}
    return store[i]