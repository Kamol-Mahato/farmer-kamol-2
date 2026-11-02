"""
প্রজ্ঞাধারা — স্লাইড ভিডিও
ক্যাপশন/স্ক্রিপ্ট → ব্র্যান্ডেড স্লাইড + AI ভয়েস (edge-tts) + SRT → একটি MP4

video-edit-tools.py-এর "📖 স্লাইড ভিডিও" ট্যাব থেকে ডাকা হয়।
ffmpeg ও PIL ছাড়া বাড়তি কিছু লাগে না (ভয়েসের জন্য edge-tts)।

স্ক্রিপ্টের নিয়ম (প্রতিটি স্লাইড `---` দিয়ে আলাদা):
    @logo | @text | @shloka   স্লাইডের ধরন (না দিলে @text)
    # লেখা                   বড় শিরোনাম
    ## লেখা                  সোনালি উপ-শিরোনাম
    - লেখা                   বুলেট
    লেখা                     সাধারণ লাইন (মাঝখানে)
    > লেখা                   ভয়েসে যা বলা হবে (পর্দায় দেখাবে না)
    ~ 6                      ভয়েস না থাকলে কত সেকেন্ড দেখাবে
"""

import asyncio
import os
import re
import shutil
import subprocess
import threading
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable, List, Optional

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


# ── স্ক্রিপ্ট পার্সার ────────────────────────────────────────────────────────
@dataclass
class Slide:
    layout: str = "text"
    items: list = field(default_factory=list)   # [(kind, text)] kind: h1 h2 p li
    voice: str = ""
    secs: Optional[float] = None


def parse_script(text: str) -> List[Slide]:
    slides = []
    for block in re.split(r"(?m)^\s*-{3,}\s*$", text or ""):
        s = Slide()
        voice = []
        for raw in block.splitlines():
            ln = raw.strip()
            if not ln or ln.startswith("//"):
                continue
            if ln.startswith("@"):
                name = ln[1:].strip().lower()
                if name in ("logo", "text", "shloka"):
                    s.layout = name
            elif ln.startswith("##"):
                s.items.append(("h2", ln[2:].strip()))
            elif ln.startswith("#"):
                s.items.append(("h1", ln[1:].strip()))
            elif ln.startswith(">"):
                voice.append(ln[1:].strip())
            elif ln.startswith("~"):
                try:
                    s.secs = float(ln[1:].strip())
                except ValueError:
                    pass
            elif ln.startswith("- "):
                s.items.append(("li", ln[2:].strip()))
            else:
                s.items.append(("p", ln))
        s.voice = " ".join(v for v in voice if v)
        if s.items or s.voice or s.layout == "logo":
            slides.append(s)
    return slides


# ── স্লাইড আঁকা ──────────────────────────────────────────────────────────────
def _mix(c1, c2, a):
    p = lambda c: tuple(int(c[i:i + 2], 16) for i in (1, 3, 5))
    a1, a2 = p(c1), p(c2)
    return tuple(int(a2[i] * a + a1[i] * (1 - a)) for i in range(3))


def logo_mark(size: int) -> Image.Image:
    """লোগো: ইন্ডিগো বৃত্ত, সোনালি সূর্য, তিন ঢেউ।"""
    import math
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


# স্লাইডের ধরন অনুযায়ী লেখার মাপ ও রং: kind → (size, color, bold)
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


# ── ভিডিও তৈরি ───────────────────────────────────────────────────────────────
@dataclass
class Options:
    footer: str = DEFAULT_FOOTER
    show_footer: bool = True
    show_mark: bool = True
    voice_on: bool = True


@dataclass
class Result:
    mp4: str
    srt: str
    voice_mp3: Optional[str]
    seconds: float


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


def _srt_time(t: float) -> str:
    t = max(0.0, t)
    ms = int(round(t * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


def _sentences(text: str) -> List[str]:
    parts = [p.strip() for p in re.findall(r"[^।.?!]+[।.?!]?", text) if p.strip()]
    return parts or [text]


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
            progress(i / n, f"স্লাইড {i + 1}/{n}")
        png = render_slide(s, str(work / f"s{i}.png"), opts.footer, opts.show_footer, opts.show_mark)
        mp3, vd = None, 0.0
        if opts.voice_on and s.voice:
            if synth is None:
                raise TTSError("ভয়েস ফাংশন দেওয়া হয়নি।")
            mp3 = str(work / f"v{i}.mp3")
            synth(s.voice, mp3)
            vd = _probe(ffprobe, mp3)
            dur = max(MIN_SLIDE, LEAD + vd + TAIL)
        elif s.voice:
            dur = max(MIN_SLIDE, s.secs or (len(s.voice) / 11.0 + 1.0))   # নীরব: কথার দৈর্ঘ্যের আন্দাজ
        else:
            dur = max(MIN_SLIDE, s.secs or SILENT_DEFAULT)

        f = min(FADE, dur / 3)
        vf = (f"format=yuv420p,loop=-1:1,trim=duration={dur:.3f},setpts=PTS-STARTPTS,"
              f"fade=t=in:st=0:d={f:.2f},fade=t=out:st={dur - f:.3f}:d={f:.2f}")
        cmd = [ffmpeg, "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", png]
        if mp3:
            cmd += ["-i", mp3, "-af", f"adelay={int(LEAD * 1000)}:all=1,apad"]
        else:
            cmd += ["-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo"]
        tmp, out = str(work / f"tmp{i}.mp4"), str(work / f"p{i}.mp4")
        cmd += ["-vf", vf, "-t", f"{dur:.3f}", "-r", str(FPS),
                "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p",
                "-c:a", "aac", "-b:a", "160k", "-ar", "44100", "-ac", "2", tmp]
        _ff(cmd, f"স্লাইড {i + 1}")
        os.replace(tmp, out)
        parts.append(out)

        if mp3 and vd > 0:
            sents = _sentences(s.voice)
            total_chars = sum(len(x) for x in sents) or 1
            cur = t0 + LEAD
            for sent in sents:
                seg = vd * len(sent) / total_chars
                srt.append((cur, cur + seg, sent))
                cur += seg
            audio_parts.append((mp3, t0 + LEAD))
        t0 += dur

    if progress:
        progress(0.95, "জোড়া লাগানো হচ্ছে")
    lst = work / "list.txt"
    lst.write_text("".join(f"file '{Path(p).as_posix()}'\n" for p in parts), encoding="utf-8")
    final = str(work / "final.mp4")
    _ff([ffmpeg, "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(lst),
         "-c", "copy", "-movflags", "+faststart", final + ".tmp.mp4"], "জোড়া")
    os.replace(final + ".tmp.mp4", final)

    srt_text = "".join(f"{k}\n{_srt_time(a)} --> {_srt_time(b)}\n{t}\n\n" for k, (a, b, t) in enumerate(srt, 1))
    voice_mp3 = None
    if audio_parts:        # শুধু ভয়েসের ট্র্যাক আলাদা ফাইলে (ইউটিউব/ফেসবুকের অন্য কাজে লাগে)
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

HELP_TEXT = """
**প্রতিটি স্লাইড `---` দিয়ে আলাদা করুন।**

| লিখুন | মানে |
|---|---|
| `@logo` / `@text` / `@shloka` | স্লাইডের ধরন (না দিলে `@text`)। `@shloka` শ্লোক দেখানোর জন্য বড় হরফ |
| `# লেখা` | বড় শিরোনাম |
| `## লেখা` | সোনালি উপ-শিরোনাম |
| `- লেখা` | বুলেট |
| `লেখা` | সাধারণ লাইন (মাঝখানে) |
| `> লেখা` | **ভয়েসে যা বলা হবে** (পর্দায় দেখাবে না)। স্লাইডের সময় ভয়েসের দৈর্ঘ্য থেকে নিজে ঠিক হয় |
| `~ 6` | ভয়েস না থাকলে স্লাইড কত সেকেন্ড থাকবে |
| `// লেখা` | মন্তব্য (বাদ যাবে) |

ভয়েসে বানান ঠিকমতো না পড়লে `>` লাইনে বানান বদলে লিখুন (পর্দার লেখা অপরিবর্তিত থাকবে)।
"""


def render_tab(ffmpeg: str, ffprobe: str, temp_dir: str, output_dir: str):
    import streamlit as st

    st.header("📖 স্লাইড ভিডিও (লেখা + AI ভয়েস)")
    st.caption("স্ক্রিপ্ট লিখুন → ব্র্যান্ডেড স্লাইড, ভয়েস ও সাবটাইটেলসহ একটি ভিডিও।")
    warn = font_status()
    if warn:
        st.warning(warn)
    if not HAS_RAQM:
        st.warning("বাংলা যুক্তাক্ষর ঠিকমতো বসাতে `packages.txt`-এ `libraqm0` ও `libfribidi0` লাগবে।")

    with st.expander("স্ক্রিপ্ট লেখার নিয়ম"):
        st.markdown(HELP_TEXT)

    script = st.text_area("স্ক্রিপ্ট", value=SAMPLE_SCRIPT, height=460, key="sv_script")
    slides = parse_script(script)
    n_voice = sum(1 for s in slides if s.voice)
    st.caption(f"{len(slides)} টি স্লাইড · ভয়েস আছে {n_voice} টিতে")

    c1, c2, c3 = st.columns(3)
    with c1:
        voice_on = st.checkbox("AI ভয়েস বানাও", value=True, key="sv_voice_on",
                               help="বন্ধ রাখলে নীরব ভিডিও হবে (কথার দৈর্ঘ্য অনুযায়ী আন্দাজি সময়)।")
    with c2:
        voice_label = st.selectbox("কণ্ঠ", list(VOICES.keys()), key="sv_voice")
    with c3:
        rate = st.slider("কথার গতি (%)", -30, 15, -5, 5, key="sv_rate",
                         help="নেগেটিভ মানে ধীরে পড়বে।")

    d1, d2 = st.columns([1, 3])
    with d1:
        show_footer = st.checkbox("নিচের বার", value=True, key="sv_footer_on")
        show_mark = st.checkbox("উপরে ডানে লোগো", value=True, key="sv_mark")
    with d2:
        footer = st.text_input("নিচের বারের লেখা", value=DEFAULT_FOOTER, key="sv_footer")
    name = st.text_input("ফাইলের নাম", value="progyadhara-video", key="sv_name")

    opts = Options(footer=footer, show_footer=show_footer, show_mark=show_mark, voice_on=voice_on)
    synth = edge_synth(VOICES[voice_label], rate)

    b1, b2 = st.columns(2)
    with b1:
        if st.button("👀 স্লাইডগুলো দেখুন (ভয়েস ছাড়া, দ্রুত)", use_container_width=True, key="sv_prev"):
            if not slides:
                st.error("স্ক্রিপ্ট খালি।")
            else:
                pdir = os.path.join(temp_dir, "slide_preview")
                Path(pdir).mkdir(parents=True, exist_ok=True)
                for i, s in enumerate(slides):
                    p = render_slide(s, os.path.join(pdir, f"p{i}.png"), footer, show_footer, show_mark)
                    st.image(p, caption=f"স্লাইড {i + 1}", use_container_width=True)
    with b2:
        first = next((s.voice for s in slides if s.voice), "")
        if st.button("🎧 প্রথম ভয়েসটা শুনে দেখুন", use_container_width=True, key="sv_hear", disabled=not first):
            try:
                Path(temp_dir).mkdir(parents=True, exist_ok=True)
                p = os.path.join(temp_dir, "voice_preview.mp3")
                synth(first, p)
                with open(p, "rb") as fh:
                    st.audio(fh.read(), format="audio/mp3")
            except TTSError as e:
                st.error(str(e))

    if st.button("🎬 ভিডিও তৈরি করুন", type="primary", use_container_width=True, key="sv_build"):
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
                with open(final, "rb") as fh:
                    mp4_bytes = fh.read()
                mp3_bytes = None
                if res.voice_mp3:
                    with open(res.voice_mp3, "rb") as fh:
                        mp3_bytes = fh.read()
                st.session_state["sv_result"] = {
                    "mp4": mp4_bytes, "srt": res.srt, "mp3": mp3_bytes,
                    "name": safe, "secs": res.seconds,
                }
                status.write("✅ শেষ")
            except TTSError as e:
                bar.empty()
                st.error(f"ভয়েস বানানো যায়নি: {e}")
                st.info("উপায়: ওপরে \"AI ভয়েস বানাও\" বন্ধ করে নীরব ভিডিও বানিয়ে নিন, "
                        "অথবা টুলটা নিজের মেশিন/Codespaces-এ চালিয়ে দেখুন।")
            except Exception as e:
                bar.empty()
                st.error(f"ভিডিও বানাতে সমস্যা: {e}")
            finally:
                shutil.rmtree(work, ignore_errors=True)

    r = st.session_state.get("sv_result")
    if r:
        st.success(f"তৈরি: প্রায় {r['secs']:.0f} সেকেন্ড")
        st.video(r["mp4"])
        k1, k2, k3 = st.columns(3)
        k1.download_button("⬇️ ভিডিও (MP4)", r["mp4"], file_name=f"{r['name']}.mp4", mime="video/mp4", key="sv_dl1")
        if r["srt"]:
            k2.download_button("⬇️ সাবটাইটেল (SRT)", r["srt"].encode("utf-8"), file_name=f"{r['name']}.srt",
                               mime="text/plain", key="sv_dl2")
        if r["mp3"]:
            k3.download_button("⬇️ শুধু ভয়েস (MP3)", r["mp3"], file_name=f"{r['name']}-voice.mp3",
                               mime="audio/mpeg", key="sv_dl3")