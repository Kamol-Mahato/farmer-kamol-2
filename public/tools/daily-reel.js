/* =====================================================================
   Farmer Kamol — Daily Reel Studio
   ফাইল: public/tools/daily-reel.js
   কাজ: ব্যাকগ্রাউন্ড ভিডিও + লেখা + তারিখ + ভয়েস-ওভার + শেষের লোগো → ৯:১৬ রিল
   সবকিছু ব্রাউজারেই চলে (কোনো সার্ভার লাগে না)।
   ===================================================================== */
   (function () {
    "use strict";
  
    const W = 1080, H = 1920, FPS = 30;
    const LS_KEY = "fk_daily_reel_v1";
    const $ = (id) => document.getElementById(id);
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const ease = {
      out: (t) => 1 - Math.pow(1 - t, 3),
      inout: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
      back: (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
    };
    const rnd = (seed) => { const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
    const bnDigits = (n) => String(n).replace(/\d/g, (c) => "০১২৩৪৫৬৭৮৯"[c]);
    const segmenter = (typeof Intl !== "undefined" && Intl.Segmenter) ? new Intl.Segmenter("bn", { granularity: "grapheme" }) : null;
    const graphemes = (s) => (segmenter ? Array.from(segmenter.segment(s), (x) => x.segment) : Array.from(s));
  
    /* ---------------- ডিফল্ট সেটিংস ---------------- */
    const DEF = {
      titleText: "", credit: "",
      dateMode: "stack", dateOrder: "after", hijriOffset: "0",
      sw: true, sb: true, se: true, sh: true, sd: true,
      extra1: "", extra2: "", extra3: "",
      bgVol: 0, loop: true, imgDur: 20, voiceVol: 1, voiceOff: 0, musicVol: 0.3,
      gap: 0.4, startDelay: 0.6,
      font: "Hind Siliguri", weight: "700", size: 72,
      color: "#ffffff", color2: "#ffe28a", creditColor: "#d8d8d8",
      outline: "none", outlineColor: "#000000", shadow: true, band: "none",
      pos: "bottom", posDate: "same", offY: 0,
      anim: "up", fx: "sparkle", fxColor: "#fff3b0", ambient: "none", ambientAmt: 0.5,
      outro: "zoomin", outroSec: 4, res: "1080", guides: true,
    };
    const NO_SAVE = ["titleText", "hijriOffset"];
  
    /* ---------------- স্টেট ---------------- */
    const S = {
      st: Object.assign({}, DEF),
      dv: { weekday: "", bn: "", en: "", hijri: "", doy: "", extra1: "", extra2: "", extra3: "" },
      dvManual: {},
      bg: null, voice: null, music: null,
      screens: [], tm: [], tmManual: false, lay: {},
      main: 15, outroDur: 4, total: 19,
      t: 0, playing: false, mode: "preview", raf: 0, startPerf: 0,
      ac: null, nodes: null, recording: false,
      logo: null, brand: null, fxc: null, built: false,
    };
    const mctx = document.createElement("canvas").getContext("2d");
  
    /* ---------------- ছোট হেল্পার ---------------- */
    function rr(ctx, x, y, w, h, r) {
      r = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }
    function star(ctx, x, y, r, rot) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI * i) / 4, q = i % 2 ? r * 0.22 : r;
        ctx.lineTo(Math.cos(a) * q, Math.sin(a) * q);
      }
      ctx.closePath(); ctx.fill(); ctx.restore();
    }
    function leaf(ctx, x, y, s, rot, col) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = col;
      ctx.beginPath(); ctx.moveTo(0, -s);
      ctx.quadraticCurveTo(s * 0.75, -s * 0.2, 0, s);
      ctx.quadraticCurveTo(-s * 0.75, -s * 0.2, 0, -s); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(0, -s * 0.9); ctx.lineTo(0, s * 0.9); ctx.stroke(); ctx.restore();
    }
    function glowDot(ctx, x, y, r, color, a) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, color); g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.globalAlpha = a; ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    function hexA(hex, a) {
      const h = (hex || "#ffffff").replace("#", "");
      const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
      return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
    }
  
    /* ---------------- তারিখ ---------------- */
    function dhakaYMD() {
      const p = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
      const [y, m, d] = p.split("-").map(Number);
      return { y, m, d };
    }
    function dayOfYear() {
      const { y, m, d } = dhakaYMD();
      return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 0)) / 86400000);
    }
    function refreshDates(force) {
      try { if (window.dpRefreshDate) window.dpRefreshDate(); } catch (_) {}
      const val = (id) => { const e = $(id); return e ? String(e.value || "").trim() : ""; };
      const now = new Date();

      let wd = val("dpWeekday");
      if (!wd) {
        try { wd = "আজ " + new Intl.DateTimeFormat("bn-BD", { timeZone: "Asia/Dhaka", weekday: "long" }).format(now); } catch (_) { wd = "আজ"; }
      }

      let bn = val("dpBnDate");
      if (!bn) {
        try { bn = new Intl.DateTimeFormat("bn-BD-u-ca-beng", { timeZone: "Asia/Dhaka", day: "numeric", month: "long", year: "numeric" }).format(now); } catch (_) { bn = ""; }
      }

      let en = val("dpEnDate");
      if (!en) {
        try { en = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", day: "numeric", month: "long", year: "numeric" }).format(now); } catch (_) { en = ""; }
      }

      let hijri = val("dpHijriDate");
      if (!hijri) {
        try {
          const offset = Number(S.st.hijriOffset || 0);
          const d = new Date(now.getTime() + offset * 86400000);
          hijri = new Intl.DateTimeFormat("bn-BD-u-ca-islamic", { timeZone: "Asia/Dhaka", day: "numeric", month: "long", year: "numeric" }).format(d);
        } catch (_) { hijri = ""; }
      }

      const doy = "আজ বছরের " + bnDigits(dayOfYear()) + " তম দিন";
      const auto = { weekday: wd, bn, en, hijri, doy };

      Object.keys(auto).forEach((k) => {
        if (force) S.dvManual[k] = false;
        if (!S.dvManual[k]) S.dv[k] = auto[k];
      });
      Object.keys(S.dv).forEach((k) => { const e = $("drv_" + k); if (e) e.value = S.dv[k]; });
    }
  
    /* ---------------- পর্দা (screens) তৈরি ---------------- */
    function buildScreens() {
      const st = S.st, out = [];
      const titles = String(st.titleText || "").split("\n").map((s) => s.trim()).filter(Boolean);
      titles.forEach((l) => {
        const lines = l.split("|").map((x) => x.trim()).filter(Boolean).map((t) => ({ t, s: 1, c: "1" }));
        if (lines.length) out.push({ kind: "title", lines });
      });
      const item = (k, flag, s) => (flag && S.dv[k] ? { t: S.dv[k], s, c: "2" } : null);
      const wd = item("weekday", st.sw, 1.12);
      const rest = [item("bn", st.sb, 0.8), item("en", st.se, 0.8), item("hijri", st.sh, 0.8), item("doy", st.sd, 0.8)].filter(Boolean);
      const extras = ["extra1", "extra2", "extra3"].map((k) => S.dv[k] ? { t: S.dv[k], s: 0.75, c: "2" } : null).filter(Boolean);
      let dsc = [];
      if (st.dateMode === "stack") {
        const all = [wd].concat(rest).concat(extras).filter(Boolean);
        if (all.length) dsc.push({ kind: "date", lines: all });
      } else if (st.dateMode === "seq") {
        if (wd) dsc.push({ kind: "date", lines: [wd] });
        if (rest.length) dsc.push({ kind: "date", lines: rest });
        extras.forEach((x) => dsc.push({ kind: "date", lines: [x] }));
      } else {
        [wd].concat(rest).concat(extras).filter(Boolean).forEach((x) => dsc.push({ kind: "date", lines: [x] }));
      }
      return st.dateOrder === "before" ? dsc.concat(out) : out.concat(dsc);
    }
    function autoTiming() {
      const st = S.st; let t = Number(st.startDelay) || 0;
      return S.screens.map((sc) => {
        const chars = sc.lines.reduce((a, l) => a + graphemes(l.t).length, 0);
        const dur = Math.round(clamp(1.8 + chars * 0.075, 2.4, 9) * 10) / 10;
        const o = { start: Math.round(t * 10) / 10, dur };
        t += dur + Number(st.gap || 0);
        return o;
      });
    }
    function recalcMain() {
      const st = S.st; let d = S.bg ? S.bg.dur : 0;
      if (S.bg && S.bg.type === "image") d = Number(st.imgDur) || 20;
      if (S.voice) d = Math.max(d, Number(st.voiceOff) + S.voice.dur);
      const last = S.tm.length ? Math.max.apply(null, S.tm.map((x) => x.start + x.dur)) : 0;
      d = Math.max(d, last + 0.8);
      if (!d || !isFinite(d)) d = 15;
      S.main = d;
      S.outroDur = st.outro === "off" ? 0 : Number(st.outroSec) || 4;
      S.total = S.main + S.outroDur;
      const sl = $("drSeek");
      if (sl) { sl.max = String(Math.round(S.total * 100)); }
      const info = $("drInfo");
      if (info) info.textContent = `মোট ${S.total.toFixed(1)} সেকেন্ড (ভিডিও/লেখা ${S.main.toFixed(1)} + শেষের পর্দা ${S.outroDur.toFixed(1)})`;
    }
    function rebuild() {
      S.screens = buildScreens();
      if (!S.tmManual || S.tm.length !== S.screens.length) { S.tm = autoTiming(); S.tmManual = false; }
      S.lay = {};
      renderTimes(); recalcMain(); renderStill();
    }
  
    /* ---------------- লেআউট ---------------- */
    function makeBlock(text, font, size, color, maxW, isCredit) {
      mctx.font = font;
      const words = text.split(/\s+/).filter(Boolean), lines = []; let cur = [];
      const meas = (a) => mctx.measureText(a.join(" ")).width;
      words.forEach((w) => {
        if (cur.length && meas(cur.concat([w])) > maxW) { lines.push(cur); cur = [w]; } else cur.push(w);
      });
      if (cur.length) lines.push(cur);
      const lh = Math.round(size * 1.4);
      const L = lines.map((ws, li) => {
        const full = ws.join(" "), width = mctx.measureText(full).width;
        const wd = ws.map((w, k) => ({ t: w, x: k ? mctx.measureText(ws.slice(0, k).join(" ") + " ").width : 0 }));
        return { text: full, width, words: wd, y: li * lh, g: graphemes(full) };
      });
      return { font, size, color, lines: L, lh, h: L.length * lh, mw: L.reduce((a, l) => Math.max(a, l.width), 0), isCredit };
    }
    function getLayout(i) {
      if (S.lay[i]) return S.lay[i];
      const sc = S.screens[i], st = S.st, maxW = W - 170, blocks = [];
      sc.lines.forEach((ln) => {
        const size = Math.round(st.size * ln.s);
        blocks.push(makeBlock(ln.t, `${st.weight} ${size}px "${st.font}","Noto Sans Bengali",sans-serif`, size, ln.c === "2" ? st.color2 : st.color, maxW, false));
      });
      if (sc.kind === "title" && String(st.credit).trim()) {
        const size = Math.round(st.size * 0.5);
        blocks.push(makeBlock(String(st.credit).trim(), `400 ${size}px "${st.font}","Noto Sans Bengali",sans-serif`, size, st.creditColor, maxW, true));
      }
      let y = 0, mw = 0;
      blocks.forEach((b, bi) => { b.y = y; y += b.h + (bi < blocks.length - 1 ? Math.round(b.size * 0.3) : 0); mw = Math.max(mw, b.mw); });
      return (S.lay[i] = { blocks, totalH: y, maxW: mw });
    }
    function blockTop(lay, sc) {
      const st = S.st;
      const pos = sc.kind === "date" && st.posDate !== "same" ? st.posDate : st.pos;
      let y;
      if (pos === "top") y = 250;
      else if (pos === "middle") y = (H - lay.totalH) / 2;
      else y = H - 420 - lay.totalH;
      return y + Number(st.offY || 0);
    }
  
    /* ---------------- আঁকা: ব্যাকগ্রাউন্ড ---------------- */
    function drawBg(ctx, t) {
      const b = S.bg;
      ctx.fillStyle = "#10261a"; ctx.fillRect(0, 0, W, H);
      if (!b || !b.w) {
        ctx.fillStyle = "rgba(255,255,255,.55)"; ctx.textAlign = "center";
        ctx.font = '700 54px "Hind Siliguri","Noto Sans Bengali",sans-serif';
        ctx.fillText("ব্যাকগ্রাউন্ড ভিডিও বা ছবি দিন", W / 2, H / 2);
        return;
      }
      if (b.type === "video" && b.el.readyState < 2) return;
      const z = b.type === "image" ? 1 + 0.08 * clamp(t / S.main, 0, 1) : 1;
      const sc = Math.max(W / b.w, H / b.h) * z;
      ctx.drawImage(b.el, (W - b.w * sc) / 2, (H - b.h * sc) / 2, b.w * sc, b.h * sc);
    }
  
    /* ---------------- আঁকা: চারপাশের ইফেক্ট (ambient) ---------------- */
    function drawAmbient(ctx, t) {
      const st = S.st, type = st.ambient;
      if (type === "none") return;
      const maxN = { dust: 46, firefly: 22, leaves: 16, petals: 22, bokeh: 12 }[type] || 0;
      const n = Math.round(maxN * Number(st.ambientAmt));
      ctx.save();
      for (let k = 0; k < n; k++) {
        const r1 = rnd(k * 7 + 1), r2 = rnd(k * 7 + 2), r3 = rnd(k * 7 + 3), r4 = rnd(k * 7 + 4);
        if (type === "dust") {
          const sp = 18 + r2 * 40, y = H + 40 - ((t * sp + r3 * H) % (H + 80));
          const x = r1 * W + Math.sin(t * 0.6 + k) * 30;
          ctx.globalCompositeOperation = "lighter";
          glowDot(ctx, x, y, 7 + r4 * 10, "rgba(255,226,150,1)", 0.25 + 0.5 * (0.5 + 0.5 * Math.sin(t * 2 + k)));
        } else if (type === "firefly") {
          const x = r1 * W + Math.sin(t * 0.5 + k * 1.7) * 130, y = H * (0.3 + 0.65 * r2) + Math.cos(t * 0.4 + k * 2.1) * 90;
          const bl = Math.pow(0.5 + 0.5 * Math.sin(t * 1.7 + k * 1.3), 2);
          ctx.globalCompositeOperation = "lighter";
          glowDot(ctx, x, y, 30 + r4 * 16, "rgba(220,255,110,1)", 0.15 + 0.7 * bl);
          glowDot(ctx, x, y, 7, "rgba(255,255,220,1)", 0.3 + 0.7 * bl);
        } else if (type === "leaves" || type === "petals") {
          const sp = 60 + r2 * 80, y = ((t * sp + r3 * (H + 160)) % (H + 160)) - 80;
          const x = r1 * W + Math.sin(t * 0.9 + k) * 70, rot = t * (0.6 + r4) + k;
          ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 0.9;
          if (type === "leaves") leaf(ctx, x, y, 24 + r4 * 22, rot, `hsl(${85 + r3 * 40},55%,${34 + r2 * 14}%)`);
          else {
            ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = r4 > 0.5 ? "#ffd23f" : "#fff6cf";
            ctx.beginPath(); ctx.ellipse(0, 0, 9 + r2 * 6, 20 + r3 * 12, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
          }
        } else if (type === "bokeh") {
          const rad = 50 + r2 * 90, y = H + rad - ((t * (14 + r3 * 20) + r4 * H) % (H + rad * 2));
          const x = r1 * W + Math.sin(t * 0.3 + k) * 40;
          ctx.globalCompositeOperation = "lighter";
          glowDot(ctx, x, y, rad, "rgba(255,240,190,1)", 0.07 + 0.08 * r3);
        }
      }
      ctx.restore();
    }
  
    /* ---------------- আঁকা: লেখা ---------------- */
    function paintText(ctx, str, x, y, b, a, K, glow) {
      const st = S.st;
      ctx.font = b.font; ctx.textBaseline = "alphabetic"; ctx.textAlign = "left"; ctx.lineJoin = "round";
      const ow = st.outline === "thin" ? b.size * 0.07 : st.outline === "thick" ? b.size * 0.14 : 0;
      ctx.globalAlpha = a;
      if (glow) { ctx.shadowColor = st.fxColor; ctx.shadowBlur = glow * K; ctx.shadowOffsetY = 0; }
      else if (st.shadow) { ctx.shadowColor = "rgba(0,0,0,.7)"; ctx.shadowBlur = 14 * K; ctx.shadowOffsetY = 4 * K; }
      if (ow) {
        ctx.strokeStyle = st.outlineColor; ctx.lineWidth = ow; ctx.strokeText(str, x, y);
        ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      }
      ctx.fillStyle = b.color; ctx.fillText(str, x, y);
      ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    }
  
    function drawScreen(ctx, i, t, K) {
      const sc = S.screens[i], tm = S.tm[i];
      if (!sc || !tm) return;
      const local = t - tm.start;
      if (local < 0 || local > tm.dur) return;
      const st = S.st, lay = getLayout(i);
      const IN = 0.8, OUT = 0.55;
      const pin = clamp(local / IN, 0, 1), pout = clamp((local - (tm.dur - OUT)) / OUT, 0, 1);
      const ein = ease.out(pin);
      let a = 1 - ease.inout(pout), tx = 0, ty = -pout * 24, sx = 1, blur = 0;
      switch (st.anim) {
        case "fade": a *= ein; break;
        case "up": a *= ein; ty += (1 - ein) * 70; break;
        case "down": a *= ein; ty -= (1 - ein) * 70; break;
        case "left": a *= ein; tx = -(1 - ein) * 150; break;
        case "right": a *= ein; tx = (1 - ein) * 150; break;
        case "pop": a *= clamp(pin * 3, 0, 1); sx = 0.55 + 0.45 * ease.back(pin); break;
        case "zoom": a *= ein; sx = 1.18 - 0.18 * ein; break;
        case "blur": a *= ein; blur = (1 - ein) * 16; break;
        default: break;
      }
      const by = blockTop(lay, sc), cx = W / 2, cy = by + lay.totalH / 2;
      const pad = 36, bw = lay.maxW + pad * 2, bx = (W - bw) / 2;
  
      ctx.save();
      // স্ক্রিম (পেছনে হালকা অন্ধকার গ্রেডিয়েন্ট) — জায়গায় স্থির
      if (st.band === "scrim") {
        const pos = sc.kind === "date" && st.posDate !== "same" ? st.posDate : st.pos;
        let g;
        if (pos === "bottom") { g = ctx.createLinearGradient(0, H - 1000, 0, H); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,.72)"); ctx.fillStyle = g; ctx.globalAlpha = a; ctx.fillRect(0, H - 1000, W, 1000); }
        else if (pos === "top") { g = ctx.createLinearGradient(0, 0, 0, 900); g.addColorStop(0, "rgba(0,0,0,.72)"); g.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = g; ctx.globalAlpha = a; ctx.fillRect(0, 0, W, 900); }
        else { const y0 = by - 300; g = ctx.createLinearGradient(0, y0, 0, by + lay.totalH + 300); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(0.5, "rgba(0,0,0,.6)"); g.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = g; ctx.globalAlpha = a; ctx.fillRect(0, y0, W, lay.totalH + 600); }
      }
      ctx.translate(cx + tx, cy + ty); ctx.scale(sx, sx); ctx.translate(-cx, -cy);
      if (blur > 0.5 && "filter" in ctx) ctx.filter = `blur(${blur * K}px)`;
      if (st.band === "dark" || st.band === "light") {
        ctx.globalAlpha = a * (st.band === "dark" ? 0.45 : 0.6);
        ctx.fillStyle = st.band === "dark" ? "#000" : "#fff";
        rr(ctx, bx, by - pad * 0.6, bw, lay.totalH + pad * 1.2, 38); ctx.fill();
      }
      const glow = st.fx === "glow" ? 24 + 12 * Math.sin(local * 3) : 0;
      // কতটা অক্ষর দেখাবে (টাইপ)
      let totalG = 0;
      lay.blocks.forEach((b) => { if (!b.isCredit) b.lines.forEach((l) => { totalG += l.g.length; }); });
      const typeDur = Math.min(2.6, 0.4 + totalG * 0.07);
      let shown = Math.floor(clamp(local / typeDur, 0, 1) * totalG), wi = 0;
      lay.blocks.forEach((b) => {
        b.lines.forEach((l) => {
          const lx = (W - l.width) / 2, ly = by + b.y + l.y + b.size * 1.08;
          if (st.anim === "type" && !b.isCredit) {
            const k = Math.min(l.g.length, Math.max(0, shown));
            shown -= k;
            if (k > 0) paintText(ctx, l.g.slice(0, k).join(""), lx, ly, b, a, K, glow);
          } else if (st.anim === "words" && !b.isCredit) {
            l.words.forEach((w) => {
              const wp = ease.out(clamp((local - wi * 0.16) / 0.5, 0, 1)); wi++;
              if (wp > 0) paintText(ctx, w.t, lx + w.x, ly + (1 - wp) * 34, b, a * wp, K, glow);
            });
          } else {
            const ca = b.isCredit && (st.anim === "type" || st.anim === "words") ? a * clamp((local - 1.2) / 0.6, 0, 1) : a;
            paintText(ctx, l.text, lx, ly, b, ca, K, glow);
          }
        });
      });
      ctx.filter = "none";
      // শাইন: আলোর রেখা লেখার ওপর দিয়ে যায়
      if (st.fx === "shine") drawShine(ctx, lay, bx, by, pad, local, a);
      ctx.restore();
      // ঝিকমিক
      if (st.fx === "sparkle") drawSparkles(ctx, i, { x: (W - lay.maxW) / 2 - 20, y: by - 10, w: lay.maxW + 40, h: lay.totalH + 20 }, local, tm.dur, a);
    }
  
    function drawShine(ctx, lay, bx, by, pad, local, a) {
      const w = Math.ceil(lay.maxW + pad * 2 + 40), h = Math.ceil(lay.totalH + pad * 2);
      if (!S.fxc) S.fxc = document.createElement("canvas");
      const c = S.fxc; if (c.width !== w) c.width = w; if (c.height !== h) c.height = h;
      const o = c.getContext("2d"); o.clearRect(0, 0, w, h);
      o.globalCompositeOperation = "source-over"; o.fillStyle = "#fff"; o.textBaseline = "alphabetic";
      lay.blocks.forEach((b) => {
        o.font = b.font;
        b.lines.forEach((l) => { o.fillText(l.text, (w - l.width) / 2, pad + b.y + l.y + b.size * 1.08); });
      });
      const cyc = 3.2, ph = (local - 0.7) % cyc;
      if (local < 0.7 || ph > 1.2) return;
      const u = ph / 1.2, gx = -200 + (w + 400) * u;
      o.globalCompositeOperation = "source-in";
      const g = o.createLinearGradient(gx - 90, 0, gx + 90, 0);
      g.addColorStop(0, hexA(S.st.fxColor, 0)); g.addColorStop(0.5, hexA(S.st.fxColor, 1)); g.addColorStop(1, hexA(S.st.fxColor, 0));
      o.fillStyle = g; o.fillRect(0, 0, w, h);
      ctx.globalAlpha = a; ctx.drawImage(c, (W - w) / 2, by - pad);
      ctx.globalAlpha = 1;
    }
  
    function drawSparkles(ctx, i, bb, local, dur, a) {
      const col = S.st.fxColor;
      ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = col;
      for (let k = 0; k < 34; k++) {
        const seed = i * 977 + k * 13, mode = k % 3;
        let u = -1, cyc = 0;
        if (mode === 0) { const tb = 0.05 + rnd(seed + 1) * 0.9; u = (local - tb) / (0.8 + rnd(seed + 5) * 0.5); }
        else if (mode === 1) { const tb = dur - 0.9 + rnd(seed + 1) * 0.55; u = (local - tb) / 0.8; }
        else {
          const per = 1.4 + rnd(seed + 1) * 1.2, ph = rnd(seed + 2) * per, v = local - ph;
          if (v >= 0) { cyc = Math.floor(v / per); u = (v - cyc * per) / per; }
        }
        if (u < 0 || u > 1) continue;
        const s2 = seed + cyc * 31;
        const x = bb.x + rnd(s2 + 2) * bb.w, y = bb.y + rnd(s2 + 3) * bb.h - u * 40;
        const al = Math.sin(Math.PI * u) * a, r = (7 + rnd(s2 + 4) * 17) * (0.55 + 0.45 * Math.sin(Math.PI * u));
        ctx.globalAlpha = al * 0.35; glowDot(ctx, x, y, r * 2.2, col, al * 0.35);
        ctx.globalAlpha = al; ctx.fillStyle = col; star(ctx, x, y, r, u * 1.4 + rnd(s2 + 6) * 3);
      }
      ctx.restore();
    }
  
    /* ---------------- শেষের পর্দা ---------------- */
    function readBrand() {
      const v = (id, d) => { const e = $(id); return e && String(e.value).trim() ? String(e.value).trim() : d; };
      return {
        name: v("dpBrandName", "Farmer Kamol"), sub: v("dpBrandSub", "খামার থেকে আপনার দরজায়"),
        tag: v("dpBrandTagline", ""), fb: v("dpLinkFb", "facebook.com/farmerkamol"),
        web: v("dpLinkWeb", "farmerkamol.com"), yt: v("dpLinkYt", "youtube.com/@Farmerkamol"),
        foot: v("dpBrandFooter", "খামার থেকে আপনার দরজায়  •  কৃষিই প্রাণ"),
      };
    }
    function drawOutro(ctx, local, K) {
      const st = S.st, B = S.brand || readBrand();
      const fade = clamp(local / 0.5, 0, 1);
      ctx.save(); ctx.globalAlpha = fade;
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#f6fcf8"); g.addColorStop(1, "#dcefe2");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // লোগো
      let sc = 1;
      const p = clamp(local / 1.3, 0, 1);
      switch (st.outro) {
        case "zoomin": sc = 0.25 + 0.75 * ease.back(p); break;
        case "zoomout": sc = 2.3 - 1.3 * ease.out(p); break;
        case "pulse": sc = (0.25 + 0.75 * ease.back(p)) * (1 + (local > 1.3 ? 0.035 * Math.sin((local - 1.3) * 3.2) : 0)); break;
        case "pop": { const q = clamp(local / 0.9, 0, 1); sc = q < 1 ? 0.2 + 0.8 * ease.back(q) : 1; break; }
        default: sc = 1;
      }
      const lx = W / 2, ly = 640, lr = 230;
      ctx.save(); ctx.translate(lx, ly); ctx.scale(sc, sc);
      ctx.shadowColor = "rgba(7,85,44,.25)"; ctx.shadowBlur = 40 * K; ctx.shadowOffsetY = 14 * K;
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(0, 0, lr + 14, 0, Math.PI * 2); ctx.fill();
      ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      ctx.lineWidth = 10; ctx.strokeStyle = "#176b3a"; ctx.beginPath(); ctx.arc(0, 0, lr + 14, 0, Math.PI * 2); ctx.stroke();
      ctx.save(); ctx.beginPath(); ctx.arc(0, 0, lr, 0, Math.PI * 2); ctx.clip();
      if (S.logo && S.logo.complete && S.logo.naturalWidth) ctx.drawImage(S.logo, -lr, -lr, lr * 2, lr * 2);
      else { ctx.fillStyle = "#176b3a"; ctx.fillRect(-lr, -lr, lr * 2, lr * 2); ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.font = "700 150px Arial"; ctx.fillText("FK", 0, 52); }
      ctx.restore(); ctx.restore();
      // টেক্সট (একটার পর একটা ভেসে আসে)
      const rise = (delay, fn) => { const q = ease.out(clamp((local - delay) / 0.6, 0, 1)); if (q <= 0) return; ctx.save(); ctx.globalAlpha = fade * q; ctx.translate(0, (1 - q) * 30); fn(); ctx.restore(); };
      ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
      rise(0.7, () => { ctx.fillStyle = "#07552c"; ctx.font = "700 92px Arial, sans-serif"; ctx.fillText(B.name, W / 2, 1040, 960); });
      rise(0.95, () => { ctx.fillStyle = "#df5c17"; ctx.font = '700 54px "Noto Sans Bengali","Hind Siliguri",sans-serif'; ctx.fillText(B.sub, W / 2, 1125, 960); });
      rise(1.2, () => {
        ctx.fillStyle = "#294c34"; ctx.font = '400 38px "Noto Sans Bengali","Hind Siliguri",sans-serif';
        const words = B.tag.split(/\s+/).filter(Boolean); let line = "", y = 1215;
        words.forEach((w) => { const t2 = line ? line + " " + w : w; if (ctx.measureText(t2).width > 900 && line) { ctx.fillText(line, W / 2, y); line = w; y += 54; } else line = t2; });
        if (line) ctx.fillText(line, W / 2, y);
      });
      const socials = [{ x: W * 0.2, c: "#1877f2", k: "fb", l: B.fb }, { x: W * 0.5, c: "#2b6cb0", k: "web", l: B.web }, { x: W * 0.8, c: "#ff0000", k: "yt", l: B.yt }];
      socials.forEach((s, idx) => rise(1.6 + idx * 0.2, () => {
        const sy = 1500;
        ctx.fillStyle = s.c; ctx.beginPath(); ctx.arc(s.x, sy, 58, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.textBaseline = "middle";
        if (s.k === "fb") { ctx.font = "700 68px Arial"; ctx.fillText("f", s.x, sy + 4); }
        else if (s.k === "yt") { ctx.beginPath(); ctx.moveTo(s.x - 15, sy - 20); ctx.lineTo(s.x - 15, sy + 20); ctx.lineTo(s.x + 24, sy); ctx.closePath(); ctx.fill(); }
        else { ctx.font = "700 44px Arial"; ctx.fillText("🌐", s.x, sy + 3); }
        ctx.textBaseline = "alphabetic"; ctx.fillStyle = "#1a1a1a"; ctx.font = "600 27px Arial"; ctx.fillText(s.l, s.x, sy + 108, 300);
      }));
      rise(2.3, () => { ctx.fillStyle = "#647768"; ctx.font = '700 30px "Noto Sans Bengali","Hind Siliguri",sans-serif'; ctx.fillText(B.foot, W / 2, 1740, 960); });
      ctx.restore();
    }
  
    /* ---------------- একটি ফ্রেম আঁকা ---------------- */
    function drawFrame(ctx, w, h, t, guides) {
      const K = w / W;
      ctx.setTransform(K, 0, 0, K, 0, 0);
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over"; ctx.shadowColor = "transparent";
      const bt = Math.min(t, S.main);
      drawBg(ctx, bt);
      if (t <= S.main) drawAmbient(ctx, t);
      if (t <= S.main + 0.01) for (let i = 0; i < S.screens.length; i++) drawScreen(ctx, i, t, K);
      if (S.outroDur > 0 && t > S.main) drawOutro(ctx, t - S.main, K);
      if (guides && S.st.guides) {
        ctx.save(); ctx.fillStyle = "rgba(255,60,60,.18)";
        ctx.fillRect(0, 0, W, 260); ctx.fillRect(0, H - 400, W, 400); ctx.fillRect(W - 150, 260, 150, H - 660);
        ctx.fillStyle = "rgba(255,255,255,.8)"; ctx.font = "600 30px sans-serif"; ctx.textAlign = "left";
        ctx.fillText("ফেসবুক বাটনের এলাকা (এখানে লেখা না রাখাই ভালো)", 30, 60); ctx.restore();
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
  
    /* ---------------- ফন্ট লোড ---------------- */
    async function ensureFonts() {
      try {
        const st = S.st, txt = "আবকখগঘ ০১২৩ Farmer";
        await Promise.all([st.weight, "400", "700"].map((wt) => document.fonts.load(`${wt} 48px "${st.font}"`, txt)));
        await document.fonts.load('700 48px "Noto Sans Bengali"', txt);
      } catch (_) {}
      S.lay = {}; renderStill();
    }
  
    /* ---------------- অডিও ও চালানো ---------------- */
    function getAC() {
      if (!S.ac) S.ac = new (window.AudioContext || window.webkitAudioContext)();
      return S.ac;
    }
    function setupAudio(from, mute, recDest) {
      const ac = getAC(), st = S.st;
      if (ac.state === "suspended") ac.resume();
      const master = ac.createGain(); master.gain.value = mute ? 0 : 1;
      master.connect(ac.destination);
      if (recDest) master.connect(recDest);
      const N = { master, srcs: [], gains: {} };
      if (S.bg && S.bg.type === "video") {
        if (!S.bg.node) S.bg.node = ac.createMediaElementSource(S.bg.el);
        const g = ac.createGain(); g.gain.value = Number(st.bgVol); S.bg.node.connect(g); g.connect(master); N.gains.bg = g; N.bgGain = g;
      }
      const now = ac.currentTime + 0.06;
      if (S.voice) {
        const s = ac.createBufferSource(); s.buffer = S.voice.buffer;
        const g = ac.createGain(); g.gain.value = Number(st.voiceVol); s.connect(g); g.connect(master);
        const off = Number(st.voiceOff), when = Math.max(0, off - from), boff = Math.max(0, from - off);
        if (boff < S.voice.dur) s.start(now + when, boff);
        N.srcs.push(s); N.gains.voice = g;
      }
      if (S.music) {
        const s = ac.createBufferSource(); s.buffer = S.music.buffer; s.loop = true;
        const g = ac.createGain(); g.gain.value = Number(st.musicVol); s.connect(g); g.connect(master);
        const remain = Math.max(0, S.total - from);
        g.gain.setValueAtTime(Number(st.musicVol), now + Math.max(0, remain - 2.5));
        g.gain.linearRampToValueAtTime(0, now + remain);
        s.start(now, from % S.music.dur); N.srcs.push(s); N.gains.music = g;
      }
      S.nodes = N;
    }
    function teardownAudio() {
      const N = S.nodes; if (!N) return;
      N.srcs.forEach((s) => { try { s.stop(); } catch (_) {} try { s.disconnect(); } catch (_) {} });
      if (S.bg && S.bg.node) { try { S.bg.node.disconnect(); } catch (_) {} }
      try { N.master.disconnect(); } catch (_) {}
      S.nodes = null;
    }
    function liveGains() {
      const N = S.nodes; if (!N) return; const st = S.st;
      if (N.gains.bg) N.gains.bg.gain.value = Number(st.bgVol);
      if (N.gains.voice) N.gains.voice.gain.value = Number(st.voiceVol);
    }
  
    let previewCtx = null, recCanvas = null, recCtx = null;
    function pctx() { if (!previewCtx) previewCtx = $("drCanvas").getContext("2d"); return previewCtx; }
  
    async function seekVideo(t) {
      const b = S.bg; if (!b || b.type !== "video") return;
      const target = b.dur ? (S.st.loop ? t % b.dur : Math.min(t, Math.max(0, b.dur - 0.05))) : 0;
      if (Math.abs(b.el.currentTime - target) < 0.02) return;
      await new Promise((res) => {
        let done = false; const fin = () => { if (!done) { done = true; b.el.removeEventListener("seeked", fin); res(); } };
        b.el.addEventListener("seeked", fin); b.el.currentTime = target; setTimeout(fin, 400);
      });
    }
    let stillBusy = false, stillAgain = false;
    async function renderStill() {
      if (!S.built || S.playing) return;
      if (stillBusy) { stillAgain = true; return; }
      stillBusy = true;
      try {
        await seekVideo(S.t);
        S.brand = readBrand();
        drawFrame(pctx(), 540, 960, S.t, true);
        updateCue(S.t); updateClock(S.t);
      } catch (e) { console.error(e); }
      stillBusy = false;
      if (stillAgain) { stillAgain = false; renderStill(); }
    }
  
    function updateClock(t) {
      const sl = $("drSeek"), lab = $("drTime");
      if (sl && document.activeElement !== sl) sl.value = String(Math.round(t * 100));
      if (lab) lab.textContent = `${t.toFixed(1)} / ${S.total.toFixed(1)} সে.`;
    }
    function updateCue(t) {
      const el = $("drCue"); if (!el) return;
      let cur = -1;
      S.tm.forEach((x, i) => { if (t >= x.start && t <= x.start + x.dur) cur = i; });
      const txt = (i) => (S.screens[i] ? S.screens[i].lines.map((l) => l.t).join("  ·  ") : "");
      el.innerHTML = cur >= 0
        ? `<b>এখন বলুন:</b> ${txt(cur)}${S.screens[cur + 1] ? `<br><small>পরের: ${txt(cur + 1)}</small>` : ""}`
        : (t > S.main ? "শেষের পর্দা" : "<small>এখন কোনো লেখা নেই</small>");
      document.querySelectorAll("#drTimes .r").forEach((r, i) => r.classList.toggle("on", i === cur));
    }
  
    function play(from, mode) {
      stop(true);
      S.mode = mode; S.playing = true; S.t = from;
      const rec = mode === "record";
      S.brand = readBrand();
      if (S.bg && S.bg.type === "video") {
        const el = S.bg.el; el.loop = !!S.st.loop;
        try { el.currentTime = S.st.loop ? from % S.bg.dur : Math.min(from, S.bg.dur - 0.05); } catch (_) {}
        el.play().catch(() => {});
      }
      setupAudio(from, mode === "cue", rec ? S.recDest : null);
      S.startPerf = performance.now() - from * 1000;
      let lastSync = 0;
      const tick = () => {
        if (!S.playing) return;
        const t = (performance.now() - S.startPerf) / 1000;
        S.t = t;
        const b = S.bg;
        if (b && b.type === "video") {
          if (t >= b.dur && !S.st.loop) { if (!b.el.paused) b.el.pause(); }
          else if (t - lastSync > 0.7) {
            lastSync = t; const exp = S.st.loop ? t % b.dur : t;
            if (Math.abs(b.el.currentTime - exp) > 0.3 && b.el.readyState > 1) { try { b.el.currentTime = exp; } catch (_) {} }
          }
        }
        if (rec) {
          drawFrame(recCtx, recCanvas.width, recCanvas.height, t, false);
          pctx().drawImage(recCanvas, 0, 0, 540, 960);
        } else drawFrame(pctx(), 540, 960, t, true);
        updateCue(t); updateClock(Math.min(t, S.total));
        if (t >= S.total) { stop(false); S.t = 0; if (S.onEnd) S.onEnd(); renderStill(); return; }
        S.raf = requestAnimationFrame(tick);
      };
      S.raf = requestAnimationFrame(tick);
      setBtns();
    }
    function stop(silent) {
      S.playing = false; cancelAnimationFrame(S.raf);
      if (S.bg && S.bg.type === "video") { try { S.bg.el.pause(); } catch (_) {} }
      teardownAudio();
      if (!silent) setBtns();
    }
  
    /* ---------------- রেকর্ড ও ডাউনলোড ---------------- */
    async function makeVideo() {
      if (S.recording) return;
      if (!S.bg) { alert("আগে ব্যাকগ্রাউন্ড ভিডিও বা ছবি দিন।"); return; }
      if (!S.screens.length) { if (!confirm("কোনো লেখা নেই। তবুও ভিডিও বানাবেন?")) return; }
      await ensureFonts();
      S.recording = true; setBtns();
      const status = $("drStatus");
      try {
        const res = S.st.res === "720" ? [720, 1280] : [1080, 1920];
        recCanvas = document.createElement("canvas"); recCanvas.width = res[0]; recCanvas.height = res[1];
        recCtx = recCanvas.getContext("2d");
        const ac = getAC(); if (ac.state === "suspended") await ac.resume();
        const dest = ac.createMediaStreamDestination(); S.recDest = dest;
        const vs = recCanvas.captureStream(FPS);
        const stream = new MediaStream([...vs.getVideoTracks(), ...dest.stream.getAudioTracks()]);
        const types = ["video/mp4;codecs=avc1.42E01E,mp4a.40.2", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
        const mime = types.find((m) => window.MediaRecorder && MediaRecorder.isTypeSupported(m)) || "";
        const rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: S.st.res === "720" ? 4000000 : 8000000 } : undefined);
        const chunks = []; rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
        const stopped = new Promise((r) => { rec.onstop = r; });
        let wl = null; try { wl = await navigator.wakeLock.request("screen"); } catch (_) {}
        status.textContent = "⏳ ভিডিও তৈরি হচ্ছে… এই ট্যাব সামনে খোলা রাখুন (ঘড়ির সময় ধরে রেকর্ড হয়)।";
        // শুরুতে ভিডিও হারিয়ে যাওয়া ঠিক করতে
        if (S.bg && S.bg.type === "video" && S.bg.el) {
          try {
            S.bg.el.pause();
            S.bg.el.currentTime = 0;
            await new Promise((r) => {
              if (S.bg.el.readyState >= 2) return r();
              const t = setTimeout(r, 900);
              S.bg.el.onloadeddata = () => { clearTimeout(t); r(); };
            });
          } catch (_) {}
        }
        const ended = new Promise((r) => { S.onEnd = r; });
        rec.start(250);
        play(0, "record");
        const prog = setInterval(() => { status.textContent = `⏳ ভিডিও তৈরি হচ্ছে… ${Math.round(clamp(S.t / S.total, 0, 1) * 100)}% — ট্যাব সামনে খোলা রাখুন`; }, 500);
        await ended; clearInterval(prog);
        await new Promise((r) => setTimeout(r, 400));
        rec.stop(); await stopped; S.onEnd = null; if (wl) { try { wl.release(); } catch (_) {} }
        const ext = mime.indexOf("mp4") >= 0 ? "mp4" : "webm";
        const blob = new Blob(chunks, { type: mime || "video/webm" });
        const url = URL.createObjectURL(blob), a = document.createElement("a");
        const d = new Date(), pad2 = (n) => String(n).padStart(2, "0");
        a.href = url; a.download = `Farmer-Kamol-Reel-${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}-${pad2(d.getHours())}${pad2(d.getMinutes())}.${ext}`;
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000);
        status.textContent = ext === "mp4" ? "✅ MP4 ভিডিও তৈরি হয়েছে, ডাউনলোড শুরু হয়েছে।" : "✅ WebM ভিডিও তৈরি হয়েছে। এই ব্রাউজারে MP4 সাপোর্ট নেই — Chrome/Edge-এর নতুন সংস্করণে MP4 পাবেন।";
      } catch (e) {
        console.error(e); stop(false);
        status.textContent = "❌ ভিডিও তৈরি ব্যর্থ: " + (e && e.message ? e.message : e);
      }
      S.recDest = null; S.recording = false; setBtns(); renderStill();
    }
  
    /* ---------------- ফাইল ইনপুট ---------------- */
    function setStatus(m) { const e = $("drStatus"); if (e) e.textContent = m; }
    function loadBg(file) {
      if (!file) return;
      stop(true);
      if (S.bg && S.bg.url) { try { URL.revokeObjectURL(S.bg.url); } catch (_) {} }
      const url = URL.createObjectURL(file);
      if (file.type.startsWith("video/")) {
        const el = document.createElement("video");
        el.playsInline = true; el.preload = "auto"; el.muted = false; el.src = url;
        el.addEventListener("loadedmetadata", () => {
          S.bg = { type: "video", el, url, dur: el.duration, w: el.videoWidth, h: el.videoHeight, name: file.name };
          S.t = 0;
          const note = (el.videoWidth / el.videoHeight > 0.7) ? " (ভিডিওটি খাড়া নয়, পর্দা ভরাতে দুই পাশ কাটা পড়বে)" : "";
          setStatus(`✅ ভিডিও লোড: ${el.duration.toFixed(1)} সে., ${el.videoWidth}×${el.videoHeight}${note}`);
          if (el.videoWidth > 2200) setStatus($("drStatus").textContent + " — বড় ফাইল, ধীর লাগলে ১০৮০ প্রস্থের ভিডিও ব্যবহার করুন।");
          recalcMain(); renderStill();
        });
        el.addEventListener("error", () => setStatus("❌ ভিডিওটি খোলা যায়নি। MP4 (H.264) ফাইল দিন।"));
      } else if (file.type.startsWith("image/")) {
        const im = new Image();
        im.onload = () => { S.bg = { type: "image", el: im, url, dur: Number(S.st.imgDur) || 20, w: im.naturalWidth, h: im.naturalHeight, name: file.name }; S.t = 0; setStatus("✅ ছবি লোড হয়েছে"); recalcMain(); renderStill(); };
        im.src = url;
      } else setStatus("❌ ভিডিও বা ছবির ফাইল দিন।");
    }
    async function loadAudio(file, key) {
      if (!file) { S[key] = null; recalcMain(); return; }
      try {
        const buf = await file.arrayBuffer();
        const ab = await getAC().decodeAudioData(buf);
        S[key] = { buffer: ab, dur: ab.duration, name: file.name };
        setStatus(`✅ ${key === "voice" ? "ভয়েস" : "মিউজিক"} লোড: ${ab.duration.toFixed(1)} সেকেন্ড`);
      } catch (e) { S[key] = null; setStatus("❌ অডিও পড়া যায়নি। MP3/WAV/M4A দিন।"); }
      recalcMain(); renderStill();
    }
  
    /* ---------------- অটো রং ---------------- */
    function autoColor() {
      if (!S.bg || !S.bg.w) { alert("আগে ব্যাকগ্রাউন্ড দিন।"); return; }
      const c = document.createElement("canvas"); c.width = 108; c.height = 192; const x = c.getContext("2d");
      drawBg(x.canvas.getContext("2d"), 0); // placeholder to keep API uniform
      x.setTransform(0.1, 0, 0, 0.1, 0, 0); drawBg(x, Math.min(S.t, S.main)); x.setTransform(1, 0, 0, 1, 0, 0);
      const lay = S.screens.length ? getLayout(0) : { totalH: 300 };
      const top = blockTop(lay, S.screens[0] || { kind: "title" });
      const y0 = clamp(Math.floor(top / 10), 0, 190), y1 = clamp(Math.ceil((top + lay.totalH) / 10), y0 + 1, 192);
      const d = x.getImageData(0, y0, 108, y1 - y0).data; let sum = 0, n = 0;
      for (let i = 0; i < d.length; i += 4) { sum += (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255; n++; }
      const L = n ? sum / n : 0.3, st = S.st;
      if (L > 0.6) { st.color = "#16221a"; st.color2 = "#7a3b00"; st.outline = "thin"; st.outlineColor = "#ffffff"; }
      else { st.color = "#ffffff"; st.color2 = "#ffe28a"; st.outline = "none"; }
      syncUI(); S.lay = {}; renderStill(); saveSt();
      setStatus(L > 0.6 ? "🎨 পেছনটা উজ্জ্বল — গাঢ় লেখা ও সাদা রেখা বসানো হয়েছে।" : "🎨 পেছনটা গাঢ় — সাদা লেখা বসানো হয়েছে।");
    }
  
    /* ---------------- সেভ/লোড ---------------- */
    let saveTimer = 0;
    function saveSt() {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        try { const o = {}; Object.keys(DEF).forEach((k) => { if (NO_SAVE.indexOf(k) < 0) o[k] = S.st[k]; }); localStorage.setItem(LS_KEY, JSON.stringify(o)); } catch (_) {}
      }, 300);
    }
    function loadSt() {
      try { const o = JSON.parse(localStorage.getItem(LS_KEY) || "null"); if (o) Object.keys(o).forEach((k) => { if (k in DEF && NO_SAVE.indexOf(k) < 0) S.st[k] = o[k]; }); } catch (_) {}
    }
  
    /* ---------------- ইউআই ---------------- */
    const OPT = {
      dateMode: [["stack", "বার উপরে, তারিখ নিচে (একসাথে)"], ["seq", "আগে বার, তারপর বার চলে গিয়ে তারিখ"], ["each", "প্রতিটি লাইন আলাদা আলাদা"]],
      dateOrder: [["after", "শিরোনামের পরে"], ["before", "শিরোনামের আগে"]],
      hijri: [["-2", "২ দিন পিছিয়ে"], ["-1", "১ দিন পিছিয়ে"], ["0", "স্বয়ংক্রিয়"], ["1", "১ দিন এগিয়ে"], ["2", "২ দিন এগিয়ে"]],
      font: [["Hind Siliguri", "হিন্দ সিলিগুড়ি (পরিষ্কার)"], ["Noto Sans Bengali", "নোটো সানস বাংলা"], ["Anek Bangla", "অনেক বাংলা"], ["Li Shadhinata", "লি স্বাধীনতা (হাতের লেখা ধাঁচ)"]],
      weight: [["400", "পাতলা"], ["600", "মাঝারি"], ["700", "মোটা"], ["800", "আরও মোটা"], ["900", "সবচেয়ে মোটা"]],
      outline: [["none", "নেই"], ["thin", "চিকন রেখা"], ["thick", "মোটা রেখা"]],
      band: [["none", "নেই"], ["dark", "গাঢ় ব্যান্ড"], ["light", "সাদা ব্যান্ড"], ["scrim", "নিচ/উপর থেকে ছায়া"]],
      pos: [["bottom", "নিচে"], ["middle", "মাঝে"], ["top", "উপরে"]],
      posDate: [["same", "শিরোনামের মতোই"], ["bottom", "নিচে"], ["middle", "মাঝে"], ["top", "উপরে"]],
      anim: [["up", "নিচ থেকে উঠে আসা"], ["fade", "ধীরে ফুটে ওঠা"], ["down", "উপর থেকে নামা"], ["left", "বাম থেকে আসা"], ["right", "ডান থেকে আসা"], ["pop", "পপ (ছোট থেকে বড়)"], ["zoom", "বড় থেকে ছোট হয়ে বসা"], ["blur", "ঝাপসা থেকে স্পষ্ট"], ["words", "শব্দ ধরে ধরে"], ["type", "টাইপ হওয়ার মতো"]],
      fx: [["sparkle", "✨ ঝিকমিক তারা"], ["shine", "শাইন (আলোর রেখা)"], ["glow", "নরম আলো (গ্লো)"], ["none", "কিছু না"]],
      ambient: [["none", "নেই"], ["dust", "সোনালি ধুলো"], ["firefly", "জোনাকি"], ["leaves", "ঝরা পাতা"], ["petals", "সরষে ফুলের পাপড়ি"], ["bokeh", "নরম আলোর বৃত্ত"]],
      outro: [["zoomin", "জুম ইন"], ["zoomout", "জুম আউট"], ["pulse", "জুম ইন + হালকা স্পন্দন"], ["pop", "পপ"], ["still", "স্থির"], ["off", "শেষের পর্দা চাই না"]],
      res: [["1080", "১০৮০×১৯২০ (সেরা মান)"], ["720", "৭২০×১২৮০ (ফোন/ধীর পিসির জন্য)"]],
    };
    const FIELDS = {
      g1: [
        { k: "bgVol", l: "ভিডিওর নিজের শব্দ (০ = মিউট)", t: "range", min: 0, max: 1, step: 0.05 },
        { k: "loop", l: "ভিডিও ছোট হলে আবার শুরু থেকে চলুক", t: "check" },
        { k: "imgDur", l: "ছবি দিলে রিলের সময় (সেকেন্ড)", t: "range", min: 5, max: 120, step: 1 },
        { k: "voiceVol", l: "ভয়েসের ভলিউম", t: "range", min: 0, max: 1.5, step: 0.05 },
        { k: "voiceOff", l: "ভয়েস আগে/পরে সরাও (সেকেন্ড)", t: "range", min: -5, max: 10, step: 0.1 },
        { k: "musicVol", l: "মিউজিকের ভলিউম", t: "range", min: 0, max: 1, step: 0.05 },
      ],
      g2: [
        { k: "titleText", l: "প্রতি Enter = নতুন পর্দা · একই পর্দায় নতুন লাইন চাইলে | চিহ্ন দিন", t: "textarea", rows: 5, p: "যেমন:\nহৃদয়ে একবার দুরত্বের বিষ মিশে গেলে|চেনা স্পর্শও ভারী হয়ে ওঠে\nআজকের লেখাটি পাঠিয়েছেন…" },
        { k: "credit", l: "ক্রেডিট লাইন (ঐচ্ছিক)", t: "text", p: "লেখাঃ …" },
      ],
      g4: [
        { k: "startDelay", l: "শুরুতে অপেক্ষা (সেকেন্ড)", t: "range", min: 0, max: 4, step: 0.1 },
        { k: "gap", l: "দুই পর্দার মাঝের বিরতি (সেকেন্ড)", t: "range", min: 0, max: 2, step: 0.1 },
      ],
      g5: [
        { k: "font", l: "ফন্ট", t: "select", o: OPT.font }, { k: "weight", l: "মোটা-পাতলা", t: "select", o: OPT.weight },
        { k: "size", l: "লেখার আকার", t: "range", min: 40, max: 130, step: 2 },
        { k: "color", l: "লেখার রং", t: "color" }, { k: "color2", l: "তারিখের লেখার রং", t: "color" }, { k: "creditColor", l: "ক্রেডিটের রং", t: "color" },
        { k: "outline", l: "লেখার চারপাশে রেখা", t: "select", o: OPT.outline }, { k: "outlineColor", l: "রেখার রং", t: "color" },
        { k: "shadow", l: "লেখার ছায়া", t: "check" },
        { k: "band", l: "লেখার পেছনে ব্যান্ড/ছায়া", t: "select", o: OPT.band },
        { k: "pos", l: "শিরোনামের জায়গা", t: "select", o: OPT.pos }, { k: "posDate", l: "তারিখের জায়গা", t: "select", o: OPT.posDate },
        { k: "offY", l: "লেখা উপরে-নিচে সরাও", t: "range", min: -500, max: 500, step: 10 },
      ],
      g6: [
        { k: "anim", l: "লেখা আসার ধরন", t: "select", o: OPT.anim },
        { k: "fx", l: "লেখার ইফেক্ট", t: "select", o: OPT.fx }, { k: "fxColor", l: "ইফেক্টের রং", t: "color" },
        { k: "ambient", l: "পুরো ভিডিওতে ভাসমান ইফেক্ট", t: "select", o: OPT.ambient },
        { k: "ambientAmt", l: "ভাসমান ইফেক্ট কতটা", t: "range", min: 0, max: 1, step: 0.05 },
      ],
      g7: [
        { k: "outro", l: "লোগোর অ্যানিমেশন", t: "select", o: OPT.outro },
        { k: "outroSec", l: "শেষের পর্দা কতক্ষণ (সেকেন্ড)", t: "range", min: 2, max: 8, step: 0.5 },
      ],
      g8: [
        { k: "res", l: "ভিডিওর সাইজ", t: "select", o: OPT.res },
        { k: "guides", l: "প্রিভিউতে ফেসবুক বাটনের এলাকা দেখাও", t: "check" },
      ],
    };
    function fHtml(f) {
      const id = "dr_" + f.k;
      if (f.t === "check") return `<label class="drc"><input type="checkbox" id="${id}" data-k="${f.k}"> ${f.l}</label>`;
      let inner;
      if (f.t === "select") inner = `<select id="${id}" data-k="${f.k}">${f.o.map((o) => `<option value="${o[0]}">${o[1]}</option>`).join("")}</select>`;
      else if (f.t === "range") inner = `<span class="rg"><input type="range" id="${id}" data-k="${f.k}" min="${f.min}" max="${f.max}" step="${f.step}"><output id="${id}_o"></output></span>`;
      else if (f.t === "color") inner = `<input type="color" id="${id}" data-k="${f.k}">`;
      else if (f.t === "textarea") inner = `<textarea id="${id}" data-k="${f.k}" rows="${f.rows || 4}" placeholder="${(f.p || "").replace(/"/g, "&quot;")}"></textarea>`;
      else inner = `<input type="text" id="${id}" data-k="${f.k}" placeholder="${f.p || ""}">`;
      return `<label class="drl"><span>${f.l}</span>${inner}</label>`;
    }
    const group = (title, open, body) => `<details class="drg" ${open ? "open" : ""}><summary>${title}</summary><div class="drb">${body}</div></details>`;
  
    const CSS = `
    #drRoot{position:fixed;inset:0;z-index:100000;background:#eaf5ee;overflow:auto;font-family:"Hind Siliguri","Noto Sans Bengali",sans-serif;color:#1d3a2a;display:none}
    #drRoot *{box-sizing:border-box}
    #drRoot .drh{position:sticky;top:0;z-index:5;display:flex;gap:10px;align-items:center;justify-content:space-between;padding:10px 16px;background:#176b3a;color:#fff}
    #drRoot .drh h2{margin:0;font-size:19px}
    #drRoot .drbtn{border:0;border-radius:10px;padding:9px 14px;font:inherit;font-weight:600;cursor:pointer;background:#fff;color:#176b3a}
    #drRoot .drbtn.p{background:#0f766e;color:#fff}.drbtn.o{background:#df5c17;color:#fff}
    #drRoot .drbtn:disabled{opacity:.5;cursor:not-allowed}
    #drRoot .drgrid{display:grid;grid-template-columns:minmax(280px,380px) 1fr minmax(220px,260px);gap:14px;padding:14px 16px;align-items:start}
    #drRoot .drctl{display:flex;flex-direction:column;gap:10px}
    #drRoot .dr-actions{position:sticky;top:70px;display:flex;flex-direction:column;gap:10px}
    #drRoot .dr-actions .drbtn{width:100%;justify-content:center;padding:13px 12px;font-size:15px}
    #drRoot .drg{background:#fff;border:1px solid #cfe3d5;border-radius:12px}
    #drRoot .drg>summary{cursor:pointer;padding:11px 14px;font-weight:700;color:#176b3a}
    #drRoot .drb{padding:4px 14px 14px;display:flex;flex-direction:column;gap:10px}
    #drRoot .drl{display:flex;flex-direction:column;gap:4px;font-size:14px;font-weight:600}
    #drRoot .drl>span:first-child{font-weight:600}
    #drRoot .drc{display:flex;gap:8px;align-items:center;font-size:14px;font-weight:600}
    #drRoot input[type=text],#drRoot textarea,#drRoot select{width:100%;padding:8px 10px;border:1px solid #b7d4c0;border-radius:8px;font:inherit;background:#fbfffc}
    #drRoot textarea{resize:vertical}
    #drRoot input[type=color]{width:60px;height:34px;padding:0;border:1px solid #b7d4c0;border-radius:8px;background:#fff}
    #drRoot .rg{display:flex;gap:8px;align-items:center}.rg input{flex:1}.rg output{min-width:42px;text-align:right;font-weight:600;color:#176b3a}
    #drRoot .dd{display:grid;grid-template-columns:auto 1fr;gap:8px;align-items:center}
    #drRoot .r{display:grid;grid-template-columns:24px 1fr 64px 64px;gap:6px;align-items:center;padding:5px 6px;border-radius:8px;font-size:13px}
    #drRoot .r.on{background:#d9f3e2;outline:2px solid #176b3a}
    #drRoot .r input{width:100%;padding:5px;border:1px solid #b7d4c0;border-radius:6px;font:inherit}
    #drRoot .r span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    #drRoot .drn{font-size:12.5px;color:#4b6656;font-weight:400}
    #drRoot .drpv{position:sticky;top:64px;display:flex;flex-direction:column;align-items:center;gap:8px}
    #drRoot #drCanvas{height:min(76vh,860px);aspect-ratio:9/16;border-radius:16px;background:#000;box-shadow:0 8px 30px rgba(0,0,0,.25)}
    #drRoot .drrow{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
    #drRoot #drSeek{width:min(100%,460px)}
    #drRoot #drCue{width:min(100%,460px);min-height:58px;background:#fff;border:1px solid #cfe3d5;border-radius:10px;padding:8px 12px;font-size:17px}
    #drRoot #drStatus{width:min(100%,460px);font-size:13.5px;text-align:center;min-height:20px}
    #drCount{position:absolute;inset:0;display:none;align-items:center;justify-content:center;font-size:150px;font-weight:800;color:#fff;text-shadow:0 4px 30px #000;pointer-events:none}
    #drRoot .drcv{position:relative}
    @media (max-width:980px){#drRoot .drgrid{grid-template-columns:1fr}#drRoot .drpv{position:static;order:-1}#drRoot .dr-actions{position:static;order:2}#drRoot #drCanvas{height:min(62vh,640px)}}
    `;
  
    function buildUI() {
      if (S.built) return;
      const st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);
      const root = document.createElement("div"); root.id = "drRoot";
      const dateRows = [["weekday", "sw", "বার"], ["bn", "sb", "বাংলা তারিখ"], ["en", "se", "ইংরেজি তারিখ"], ["hijri", "sh", "হিজরি তারিখ"], ["doy", "sd", "বছরের কততম দিন"]]
        .map((r) => `<div class="dd"><label class="drc"><input type="checkbox" id="dr_${r[1]}" data-k="${r[1]}"> ${r[2]}</label><input type="text" id="drv_${r[0]}" data-dk="${r[0]}"></div>`).join("");
      root.innerHTML = `
      <div class="drh"><h2>🎞️ Farmer Kamol Daily Reel</h2>
        <div style="display:flex;gap:8px"><button class="drbtn" id="drReset">↺ স্টাইল ডিফল্টে</button><button class="drbtn" id="drClose">✕ বন্ধ করুন</button></div></div>
      <div class="drgrid">
        <div class="drpv">
          <div class="drcv"><canvas id="drCanvas" width="540" height="960"></canvas><div id="drCount"></div></div>
          <input type="range" id="drSeek" min="0" max="1500" value="0">
          <div class="drrow"><span id="drTime">0.0 / 0.0 সে.</span></div>
          <div id="drCue"></div>
          <div id="drInfo" class="drn"></div>
          <div id="drStatus"></div>
        </div>
        <div class="drctl">
          ${group("১. ব্যাকগ্রাউন্ড ও শব্দ", true, `
            <label class="drl"><span>ব্যাকগ্রাউন্ড ভিডিও (বা ছবি)</span><input type="file" id="drBg" accept="video/*,image/*"></label>
            <label class="drl"><span>ভয়েস-ওভার অডিও</span><input type="file" id="drVoice" accept="audio/*"></label>
            <label class="drl"><span>ব্যাকগ্রাউন্ড মিউজিক (ঐচ্ছিক)</span><input type="file" id="drMusic" accept="audio/*"></label>
            ${FIELDS.g1.map(fHtml).join("")}`)}
          ${group("২. শিরোনাম ও ক্রেডিট", true, FIELDS.g2.map(fHtml).join(""))}
          ${group("৩. বার ও তারিখ", true, `
            ${fHtml({ k: "dateMode", l: "দেখানোর ধরন", t: "select", o: OPT.dateMode })}
            ${fHtml({ k: "dateOrder", l: "কখন আসবে", t: "select", o: OPT.dateOrder })}
            ${fHtml({ k: "hijriOffset", l: "হিজরি তারিখ সংশোধন", t: "select", o: OPT.hijri })}
            ${dateRows}
            <label class="drl"><span>অতিরিক্ত লাইন-১</span><input type="text" id="drv_extra1" data-dk="extra1" placeholder="অতিরিক্ত লাইন ১"></label>
            <label class="drl"><span>অতিরিক্ত লাইন-২</span><input type="text" id="drv_extra2" data-dk="extra2" placeholder="অতিরিক্ত লাইন ২"></label>
            <label class="drl"><span>অতিরিক্ত লাইন-৩</span><input type="text" id="drv_extra3" data-dk="extra3" placeholder="অতিরিক্ত লাইন ৩"></label>
            <button class="drbtn" id="drDates" style="background:#e1f3e6">↻ তারিখ আবার অটো বসাও</button>
            <div class="drn">ঘরে টিক দিলে সেই লাইন দেখাবে। লেখা বদলাতে চাইলে সরাসরি ঘরে লিখুন।</div>`)}
          ${group("৪. সময় (লেখা কখন আসবে)", false, `
            ${FIELDS.g4.map(fHtml).join("")}
            <div id="drTimes"></div>
            <button class="drbtn" id="drAuto" style="background:#e1f3e6">↻ লেখা অনুযায়ী অটো সময় বসাও</button>
            <div class="drn">প্রতিটি পর্দার শুরুর সেকেন্ড ও কতক্ষণ থাকবে — হাতে বদলানো যায়। অটো সময় লেখার পরিমাণ দেখে বসে।</div>`)}
          ${group("৫. লেখার স্টাইল (রং, ফন্ট, জায়গা)", false, `${FIELDS.g5.map(fHtml).join("")}<button class="drbtn" id="drAutoCol" style="background:#e1f3e6">🎨 ভিডিও দেখে অটো রং</button>`)}
          ${group("৬. অ্যানিমেশন ও ইফেক্ট", false, FIELDS.g6.map(fHtml).join(""))}
          ${group("৭. শেষের লোগো পর্দা", false, `${FIELDS.g7.map(fHtml).join("")}<div class="drn">লোগো, নাম, স্লোগান ও লিংকের লেখা Daily Post-এর "ব্র্যান্ডিং" ঘর থেকে আসে।</div>`)}
          ${group("৮. আউটপুট", false, FIELDS.g8.map(fHtml).join(""))}
        </div>
        <div class="dr-actions">
          <button class="drbtn p" id="drPlay">▶ প্রিভিউ</button>
          <button class="drbtn" id="drStop">⏹ থামাও</button>
          <button class="drbtn" id="drCue2">🎙️ ভয়েস রেকর্ডের জন্য (৩-২-১)</button>
          <button class="drbtn o" id="drMake">🎬 ভিডিও তৈরি ও ডাউনলোড</button>
        </div>
      </div>`;
      document.body.appendChild(root);
      S.built = true; bindUI(root);
    }
  
    function syncUI() {
      Object.keys(DEF).forEach((k) => {
        const e = $("dr_" + k); if (!e) return;
        if (e.type === "checkbox") e.checked = !!S.st[k]; else e.value = S.st[k];
        const o = $("dr_" + k + "_o"); if (o) o.textContent = fmtOut(k, S.st[k]);
      });
      Object.keys(S.dv).forEach((k) => { const e = $("drv_" + k); if (e) e.value = S.dv[k]; });
    }
    function fmtOut(k, v) { return k === "size" || k === "offY" ? String(v) : (k === "bgVol" || k === "voiceVol" || k === "musicVol" || k === "ambientAmt") ? Math.round(v * 100) + "%" : String(v); }
  
    const STRUCT = ["titleText", "credit", "dateMode", "dateOrder", "sw", "sb", "se", "sh", "sd", "gap", "startDelay"];
    const TIMING = ["voiceOff", "imgDur", "loop", "outro", "outroSec"];
    function onChange(k) {
      if (STRUCT.indexOf(k) >= 0) rebuild();
      else if (TIMING.indexOf(k) >= 0) { recalcMain(); renderStill(); }
      else if (k === "bgVol" || k === "voiceVol" || k === "musicVol") liveGains();
      else if (k === "hijriOffset") { const d = $("dpHijriOffset"); if (d) d.value = String(S.st.hijriOffset); refreshDates(false); rebuild(); }
      else { S.lay = {}; if (k === "font" || k === "weight") ensureFonts(); renderStill(); }
      saveSt();
    }
    function renderTimes() {
      const box = $("drTimes"); if (!box) return;
      box.innerHTML = S.screens.length ? S.screens.map((sc, i) =>
        `<div class="r"><b>${i + 1}</b><span title="${sc.lines.map((l) => l.t).join(" / ")}">${sc.lines.map((l) => l.t).join(" / ")}</span>` +
        `<input type="number" step="0.1" min="0" data-ti="${i}" data-f="start" value="${S.tm[i].start}"><input type="number" step="0.1" min="0.5" data-ti="${i}" data-f="dur" value="${S.tm[i].dur}"></div>`).join("")
        + `<div class="drn">কলাম: ক্রম · লেখা · শুরু (সে.) · থাকবে (সে.)</div>`
        : `<div class="drn">লেখা দিলে এখানে সময়ের তালিকা আসবে।</div>`;
    }
    function setBtns() {
      const rec = S.recording;
      const q = (id) => $(id);
      if (!q("drPlay")) return;
      q("drPlay").textContent = S.playing && S.mode === "preview" ? "⏸ বিরতি" : "▶ প্রিভিউ";
      q("drPlay").disabled = rec; q("drCue2").disabled = rec; q("drMake").disabled = rec; q("drStop").disabled = false;
      q("drStop").textContent = rec ? "⏹ বাতিল" : "⏹ থামাও";
    }
  
    function bindUI(root) {
      root.addEventListener("input", (e) => {
        const t = e.target;
        if (t.dataset.k) {
          const k = t.dataset.k;
          S.st[k] = t.type === "checkbox" ? t.checked : t.type === "range" ? Number(t.value) : t.value;
          const o = $("dr_" + k + "_o"); if (o) o.textContent = fmtOut(k, S.st[k]);
          onChange(k);
        } else if (t.dataset.dk) {
          S.dv[t.dataset.dk] = t.value; S.dvManual[t.dataset.dk] = true; rebuild();
        } else if (t.dataset.ti !== undefined) {
          const i = Number(t.dataset.ti), f = t.dataset.f; S.tm[i][f] = Math.max(0, Number(t.value) || 0); S.tmManual = true;
          recalcMain(); renderStill();
        }
      });
      $("drBg").addEventListener("change", (e) => loadBg(e.target.files[0]));
      $("drVoice").addEventListener("change", (e) => loadAudio(e.target.files[0], "voice"));
      $("drMusic").addEventListener("change", (e) => loadAudio(e.target.files[0], "music"));
      $("drClose").onclick = closeReel;
      $("drReset").onclick = () => { const keep = { titleText: S.st.titleText, hijriOffset: S.st.hijriOffset }; S.st = Object.assign({}, DEF, keep); syncUI(); S.lay = {}; rebuild(); saveSt(); ensureFonts(); };
      $("drDates").onclick = () => { refreshDates(true); rebuild(); };
      $("drAuto").onclick = () => { S.tmManual = false; rebuild(); };
      $("drAutoCol").onclick = autoColor;
      $("drPlay").onclick = () => {
        if (S.recording) return;
        if (S.playing && S.mode === "preview") { stop(false); return; }
        play(S.t >= S.total - 0.1 ? 0 : S.t, "preview");
      };
      $("drStop").onclick = () => { if (S.recording) { stop(false); S.recording = false; if (S.onEnd) S.onEnd(); return; } stop(false); S.t = 0; renderStill(); };
      $("drSeek").addEventListener("input", (e) => { if (S.playing) stop(false); S.t = Number(e.target.value) / 100; renderStill(); });
      $("drCue2").onclick = () => {
        if (S.recording) return; stop(false); S.t = 0;
        const c = $("drCount"); let n = 3; c.style.display = "flex"; c.textContent = n;
        const iv = setInterval(() => { n--; if (n <= 0) { clearInterval(iv); c.style.display = "none"; play(0, "cue"); } else c.textContent = n; }, 1000);
      };
      $("drMake").onclick = makeVideo;
    }
  
    /* ---------------- খোলা/বন্ধ ---------------- */
    async function openReel() {
      if (!S.built) {
        loadSt(); buildUI();
        S.logo = new Image(); S.logo.crossOrigin = "anonymous"; S.logo.src = "/uploads/logo.png";
        S.logo.onload = () => renderStill();
      }
      const dpOff = $("dpHijriOffset"); if (dpOff) S.st.hijriOffset = dpOff.value || "0";
      refreshDates(false); syncUI();
      $("drRoot").style.display = "block";
      S.screens = buildScreens(); S.tm = []; S.tmManual = false;
      rebuild(); await ensureFonts();
      if (!S.bg) setStatus("ব্যাকগ্রাউন্ড ভিডিও দিয়ে শুরু করুন।");
    }
    function closeReel() { stop(false); if ($("drRoot")) $("drRoot").style.display = "none"; }
  
    window.openDailyReel = openReel;
    window.closeDailyReel = closeReel;
    if (window.__DR_TEST__) window.__DR_TEST__ = { S, DEF, drawFrame, buildScreens, autoTiming, getLayout, rebuild, buildUI, recalcMain, drawOutro, readBrand };
  })();