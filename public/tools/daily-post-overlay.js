/* =====================================================================
   Farmer Kamol — Daily Post : "ছবির উপরে লেখা" মোড
   ফাইল: public/tools/daily-post-overlay.js

   কী করে:
   • থাম্বনেইল-মেকারের Daily Post স্টুডিওতে একটা নতুন প্যানেল যোগ করে
   • সুইচ চালু করলে লেখা, তারিখ, লোগো ও ফ্রেম সবই ছবির উপরে বসে
   • সব অপশন কাস্টম (স্টাইল, ফ্রেম, লোগো, শিরোনাম, তারিখ, পট্টি, রেশিও)
   • সুইচ প্রতিবার বন্ধ অবস্থায় শুরু হয় — পুরনো ডিজাইন অক্ষত থাকে

   থাম্বনেইল-মেকার এই ফাইলের window.DPOverlay এর তিনটা ফাংশন ডাকে:
     render(env)  → মোড চালু থাকলে ক্যানভাসে আঁকে, true ফেরত দেয়
     download()   → মোড চালু থাকলে PNG ডাউনলোড করে, true ফেরত দেয়
     active()     → মোড চালু আছে কি না
   ===================================================================== */
   (function () {
    "use strict";
  
    // সেটিং ভার্সন: নিচের DEF এর কাঠামো বদলালে এই সংখ্যা বাড়ান।
    // তাহলে ব্রাউজারে জমে থাকা পুরনো সেটিং নিজে থেকেই বাদ পড়বে।
    var VER = 1;
    var KEY = "fk_dp_overlay";
  
    var $ = function (id) { return document.getElementById(id); };
  
    // ফ্রেমের ধরন: b = মোটা (px, ১০৮০ স্কেলে), r = ছবির কোণের গোলাকার ভাব, main = ডিফল্ট রঙ
    var FRAMES = {
      none:   { b: 0,  r: 0,  main: "#fbf5e5" },
      cream:  { b: 62, r: 14, main: "#fbf5e5" },
      green:  { b: 56, r: 22, main: "#104a26" },
      nokshi: { b: 78, r: 0,  main: "#125428" },
      pages:  { b: 66, r: 12, main: "#faf4e4" }
    };
  
    var RATIOS = {
      "4x5":  [1080, 1350],
      "1x1":  [1080, 1080],
      "9x16": [1080, 1920],
      "16x9": [1920, 1080]
    };
  
    // ডিফল্ট সেটিং
    var DEF = {
      ratio: "4x5", cw: 1080, ch: 1350,
      style: "classic", vpos: "auto", align: "auto",
      tFont: "Hind Siliguri", tWeight: "700", tSize: 104,
      tColor1: "#ffffff", tColor2: "#ffe882",
      tShadow: true, tOutline: false, divider: true,
      dateOn: true, dateStyle: "capsule", capColor: "#126434",
      showWd: true, showEn: true, showBn: true, showHj: true, showExtra: true,
      logoOn: true, logoPos: "tr", logoSize: 130, logoShape: "circle", logoRing: true,
      showName: true, showSlogan: true,
      frame: "cream", frameColor: "#fbf5e5", accent: "#f4c850",
      barOn: true, barColor: "#0e4624", barFb: true, barWeb: true, barYt: true,
      shade: "bottom", shadeStr: 80, vignette: true
    };
  
    // বর্তমান অবস্থা। on / title / logoImg সেভ হয় না (প্রতিবার নতুন)।
    var S = {};
    var k0;
    for (k0 in DEF) { S[k0] = DEF[k0]; }
    S.on = false;
    S.title = "";
    S.logoImg = null;
  
    // ───────────── সেভ / লোড ─────────────
    function loadSaved() {
      try {
        var raw = localStorage.getItem(KEY);
        if (!raw) return;
        var o = JSON.parse(raw);
        if (!o || o.v !== VER || !o.s) return; // ভার্সন না মিললে বাদ
        for (var k in DEF) {
          if (k in o.s && typeof o.s[k] === typeof DEF[k]) S[k] = o.s[k];
        }
      } catch (e) {}
    }
    function save() {
      try {
        var s = {};
        for (var k in DEF) s[k] = S[k];
        localStorage.setItem(KEY, JSON.stringify({ v: VER, s: s }));
      } catch (e) {}
    }
    loadSaved();
  
    // ───────────── ছোট সহায়ক ফাংশন ─────────────
    function dims() {
      if (S.ratio === "custom") {
        return {
          w: Math.max(400, Math.min(3000, Math.round(S.cw) || 1080)),
          h: Math.max(400, Math.min(3000, Math.round(S.ch) || 1350))
        };
      }
      var r = RATIOS[S.ratio] || RATIOS["4x5"];
      return { w: r[0], h: r[1] };
    }
  
    function rr(c, x, y, w, h, r) {
      r = Math.max(0, Math.min(r, w / 2, h / 2));
      c.beginPath();
      c.moveTo(x + r, y);
      c.arcTo(x + w, y, x + w, y + h, r);
      c.arcTo(x + w, y + h, x, y + h, r);
      c.arcTo(x, y + h, x, y, r);
      c.arcTo(x, y, x + w, y, r);
      c.closePath();
    }
  
    function diamond(c, cx, cy, r, fill) {
      c.fillStyle = fill;
      c.beginPath();
      c.moveTo(cx, cy - r);
      c.lineTo(cx + r, cy);
      c.lineTo(cx, cy + r);
      c.lineTo(cx - r, cy);
      c.closePath();
      c.fill();
    }
  
    function fam() {
      return "'" + S.tFont + "', 'Noto Sans Bengali', sans-serif";
    }
  
    function valOf(id) {
      var el = $(id);
      return el && typeof el.value === "string" ? el.value.trim() : "";
    }
  
    function cleanLink(s) {
      return String(s || "").replace(/^https?:\/\//i, "").replace(/\/+$/, "");
    }
  
    function wrapLines(c, text, maxW) {
      var out = [];
      String(text || "").replace(/\r/g, "").split("\n").forEach(function (p) {
        var words = p.trim().split(/\s+/).filter(Boolean);
        if (!words.length) return;
        var line = "";
        words.forEach(function (w) {
          var t = line ? line + " " + w : w;
          if (c.measureText(t).width > maxW && line) { out.push(line); line = w; }
          else line = t;
        });
        if (line) out.push(line);
      });
      return out;
    }
  
    // লেখা চওড়ায় না আঁটলে ফন্ট ছোট করে, ফন্ট স্ট্রিং ফেরত দেয়
    function fitFont(c, text, weight, size, family, maxW, minSize) {
      var s = size;
      c.font = weight + " " + s + "px " + family;
      while (c.measureText(text).width > maxW && s > minSize) {
        s -= 1;
        c.font = weight + " " + s + "px " + family;
      }
      return weight + " " + s + "px " + family;
    }
  
    function drawText(c, s, x, y, font, color, align, u, opt) {
      c.font = font;
      c.textAlign = align;
      c.textBaseline = "middle";
      if (opt && opt.outline) {
        c.save();
        c.shadowColor = "transparent";
        c.lineWidth = 7 * u;
        c.lineJoin = "round";
        c.strokeStyle = "rgba(0,0,0,.85)";
        c.strokeText(s, x, y);
        c.restore();
      }
      if (opt && opt.shadow) {
        c.shadowColor = "rgba(0,0,0,.6)";
        c.shadowBlur = 10 * u;
        c.shadowOffsetX = 0;
        c.shadowOffsetY = 4 * u;
      }
      c.fillStyle = color;
      c.fillText(s, x, y);
      c.shadowColor = "transparent";
      c.shadowBlur = 0;
      c.shadowOffsetY = 0;
    }
  
    // ফন্ট লোড হওয়ার পর একবার রি-রেন্ডার (প্রথমবার ক্যানভাসে ফন্ট না আসার সমস্যা ঠেকাতে)
    var warmed = {};
    function warmFont() {
      var f = S.tFont;
      if (warmed[f] || !document.fonts || !document.fonts.load) return;
      warmed[f] = true;
      Promise.all([
        document.fonts.load("700 40px '" + f + "'", "অআকখ"),
        document.fonts.load("400 40px '" + f + "'", "অআকখ")
      ]).then(function () {
        if (window.dpRender) window.dpRender();
      }).catch(function () {});
    }
  
    // ───────────── ছবি আঁকা (কভার + প্যান) ─────────────
    function drawPhoto(c, img, x, y, w, h, zoom, ox, oy) {
      var z = Math.max(1, zoom || 1);
      var s = Math.max(w / img.width, h / img.height) * z;
      var dw = img.width * s, dh = img.height * s;
      var dx = x + (w - dw) / 2 + (ox || 0);
      var dy = y + (h - dh) / 2 + (oy || 0);
      dx = Math.min(x, Math.max(x + w - dw, dx));
      dy = Math.min(y, Math.max(y + h - dh, dy));
      c.drawImage(img, dx, dy, dw, dh);
    }
  
    // ───────────── ছায়া ও ভিনিয়েট ─────────────
    function drawShade(c, rx, ry, rw, rh) {
      var a = 0.88 * (S.shadeStr / 100);
      if (S.shade !== "none" && a > 0) {
        var bottom = S.shade === "bottom";
        var g = c.createLinearGradient(0, bottom ? ry + rh : ry, 0, bottom ? ry + rh * 0.42 : ry + rh * 0.58);
        g.addColorStop(0, "rgba(4,16,7," + a + ")");
        g.addColorStop(0.35, "rgba(4,16,7," + (a * 0.63) + ")");
        g.addColorStop(0.7, "rgba(4,16,7," + (a * 0.22) + ")");
        g.addColorStop(1, "rgba(4,16,7,0)");
        c.fillStyle = g;
        c.fillRect(rx, ry, rw, rh);
      }
      if (S.vignette) {
        var cx = rx + rw / 2, cy = ry + rh / 2;
        var r1 = Math.max(rw, rh) * 0.78;
        var v = c.createRadialGradient(cx, cy, Math.min(rw, rh) * 0.4, cx, cy, r1);
        v.addColorStop(0, "rgba(0,0,0,0)");
        v.addColorStop(1, "rgba(0,0,0,.38)");
        c.fillStyle = v;
        c.fillRect(rx, ry, rw, rh);
      }
    }
  
    // ───────────── লোগো ও ব্র্যান্ড নাম ─────────────
    function drawLogo(c, env, rx, ry, rw, rh, u, m, barH) {
      var res = { atTop: S.logoPos.charAt(0) === "t", top: 0, bottom: 0, has: false };
      var img = S.logoImg || env.logo;
      var haveImg = !!(img && img.complete !== false && (img.naturalWidth || img.width));
      var ls = (S.logoOn && haveImg) ? S.logoSize * u : 0;
      var nameTxt = valOf("dpBrandName") || "Farmer Kamol";
      var subTxt = valOf("dpBrandSub") || "খামার থেকে আপনার দরজায়";
      var showN = S.showName, showS = S.showSlogan;
      if (!ls && !showN && !showS) return res;
      res.has = true;
  
      var right = S.logoPos.charAt(1) === "r";
      var textH = (showN ? 52 * u : 0) + (showS ? 36 * u : 0);
      var blockH = Math.max(ls + (ls && S.logoRing ? 10 * u : 0), textH);
      var x = right ? rx + rw - m - ls : rx + m;
      var y = res.atTop ? ry + m : ry + rh - barH - m - blockH;
      var ly = y + (blockH - ls) / 2;
  
      if (ls) {
        var shape = S.logoShape;
        c.save();
        if (shape !== "none") {
          // ছায়া + রিং
          if (S.logoRing) {
            c.save();
            c.shadowColor = "rgba(0,0,0,.55)";
            c.shadowBlur = 16 * u;
            c.shadowOffsetY = 6 * u;
            c.fillStyle = S.accent;
            if (shape === "circle") { c.beginPath(); c.arc(x + ls / 2, ly + ls / 2, ls / 2 + 5 * u, 0, Math.PI * 2); c.fill(); }
            else { rr(c, x - 5 * u, ly - 5 * u, ls + 10 * u, ls + 10 * u, ls * 0.2 + 5 * u); c.fill(); }
            c.restore();
          }
          if (shape === "circle") { c.beginPath(); c.arc(x + ls / 2, ly + ls / 2, ls / 2, 0, Math.PI * 2); c.clip(); }
          else { rr(c, x, ly, ls, ls, ls * 0.2); c.clip(); }
        }
        c.drawImage(img, x, ly, ls, ls);
        c.restore();
      }
  
      if (showN || showS) {
        var tx = right ? (ls ? x - 26 * u : rx + rw - m) : (ls ? x + ls + 26 * u : rx + m);
        var al = right ? "right" : "left";
        var ty = y + (blockH - textH) / 2;
        var maxTW = Math.max(120 * u, rw - 2 * m - ls - 40 * u);
        if (showN) {
          drawText(c, nameTxt, tx, ty + 24 * u, fitFont(c, nameTxt, "700", 44 * u, fam(), maxTW, 20 * u), "#ffffff", al, u, { shadow: true });
          ty += 52 * u;
        }
        if (showS) {
          drawText(c, subTxt, tx, ty + 16 * u, fitFont(c, subTxt, "400", 27 * u, fam(), maxTW, 14 * u), "#ebf5e1", al, u, { shadow: true });
        }
      }
      res.top = y;
      res.bottom = y + blockH;
      return res;
    }
  
    // ───────────── তারিখের লেখা ─────────────
    function dateParts(env) {
      var d = env.dates || {};
      function g(id, key) { return valOf(id) || (d && d[key]) || ""; }
      var wd = S.showWd ? g("dpWeekday", "weekday") : "";
      var en = S.showEn ? g("dpEnDate", "english") : "";
      var bn = S.showBn ? g("dpBnDate", "bn") : "";
      var hj = S.showHj ? g("dpHijriDate", "hijri") : "";
      var l1 = [wd, en].filter(Boolean).join("  •  ");
      var l2 = [bn, hj].filter(Boolean).join("  •  ");
      var ex = [];
      if (S.showExtra) {
        var e1 = valOf("dpExtra1"), e2 = valOf("dpExtra2");
        if (e1) ex.push(e1);
        if (e2) ex.push(e2);
      }
      if (!S.dateOn) { l1 = ""; l2 = ""; }
      return { l1: l1, l2: l2, ex: ex };
    }
  
    // ───────────── লেখা ও তারিখের মূল অংশ ─────────────
    function drawContent(c, env, rx, ry, rw, rh, u) {
      var m = 52 * u;
      var acc = S.accent;
      var barH = S.barOn ? 84 * u : 0;
      var barTop = ry + rh - barH;
      var style = S.style;
      var card = style === "card";
      var padC = card ? 40 * u : 0;
      var L = rx + m + padC, R = rx + rw - m - padC, maxW = R - L;
  
      // লোগো (নিচের কোণে হলে লেখার জায়গা সীমিত হবে)
      var logo = drawLogo(c, env, rx, ry, rw, rh, u, m, barH);
  
      var al = S.align === "auto"
        ? ({ classic: "left", center: "center", card: "left", top: "left", middle: "center" }[style] || "left")
        : S.align;
      var ax = al === "left" ? L : (al === "right" ? R : (L + R) / 2);
  
      // শিরোনাম মাপা
      var tlines = [], tsize = S.tSize * u, tfont = "";
      var ttxt = (S.title || "").trim();
      if (ttxt) {
        var k, lines = [];
        for (k = 0; k <= 14; k++) {
          var sz = S.tSize * u * (1 - k * 0.04);
          c.font = S.tWeight + " " + sz + "px " + fam();
          lines = wrapLines(c, ttxt, maxW);
          var fits = lines.length <= 5 && lines.every(function (l) { return c.measureText(l).width <= maxW + 1; });
          if (fits || k === 14) { tsize = sz; break; }
        }
        tlines = lines.slice(0, 5);
        tfont = S.tWeight + " " + tsize + "px " + fam();
      }
      var tlh = tsize * 1.2;
      var tH = tlines.length * tlh;
      var divOn = S.divider && tlines.length > 0;
      var titleBlockH = tH + (divOn ? 14 * u + 6 * u : 0);
  
      // তারিখ মাপা
      var dp = dateParts(env);
      var capH = 70 * u, l2H = 44 * u, exH = 40 * u, plainH = 56 * u;
      var capFont = "", capW = 0, capPad = 30 * u, l1Font = "";
      if (dp.l1) {
        if (S.dateStyle === "capsule") {
          capFont = fitFont(c, dp.l1, "700", 36 * u, fam(), maxW - 2 * capPad, 18 * u);
          capW = c.measureText(dp.l1).width + 2 * capPad;
        } else {
          l1Font = fitFont(c, dp.l1, "700", 40 * u, fam(), maxW, 18 * u);
        }
      }
      var l2Font = dp.l2 ? fitFont(c, dp.l2, "400", 29 * u, fam(), maxW, 14 * u) : "";
      var dateH = (dp.l1 ? (S.dateStyle === "capsule" ? capH + 14 * u : plainH) : 0) + (dp.l2 ? l2H : 0) + dp.ex.length * exH;
  
      var gap = (titleBlockH && dateH) ? 24 * u : 0;
      var stackH = titleBlockH + gap + dateH;
      if (!stackH) { drawBar(c, rx, ry, rw, rh, u, m, barH); return; }
  
      // কোথায় বসবে
      var vp = S.vpos === "auto"
        ? ({ classic: "bottom", center: "bottom", card: "bottom", top: "split", middle: "middle" }[style] || "bottom")
        : S.vpos;
      var bottomLimit = barTop - (card ? 44 * u : 40 * u);
      if (logo.has && !logo.atTop) bottomLimit = Math.min(bottomLimit, logo.top - 30 * u);
      var topStart = (logo.has && logo.atTop) ? Math.max(ry + m, logo.bottom + 40 * u) : ry + m;
  
      var yT, yD;
      if (vp === "split") {
        yT = topStart;
        yD = bottomLimit - dateH;
      } else {
        var yS;
        if (vp === "top") yS = topStart;
        else if (vp === "middle") yS = ry + (barTop - ry - stackH) / 2 + 30 * u;
        else yS = bottomLimit - stackH;
        yT = yS;
        yD = yS + titleBlockH + gap;
      }
  
      // কার্ডের পেছনের জমিন
      if (card) {
        var cy0 = (vp === "split" ? yT : yT) - 40 * u;
        var cy1 = yD + dateH + 40 * u;
        c.save();
        rr(c, rx + m, cy0, rw - 2 * m, cy1 - cy0, 34 * u);
        c.fillStyle = "rgba(8,38,18,.84)";
        c.fill();
        c.lineWidth = 3 * u;
        c.strokeStyle = acc;
        c.stroke();
        c.restore();
      }
  
      // শিরোনাম আঁকা
      var opt = { shadow: S.tShadow, outline: S.tOutline };
      var i;
      for (i = 0; i < tlines.length; i++) {
        drawText(c, tlines[i], ax, yT + i * tlh + tlh / 2, tfont, i === 0 ? S.tColor1 : S.tColor2, al, u, opt);
      }
      if (divOn) {
        var dw = 150 * u;
        var dx = al === "left" ? ax : (al === "right" ? ax - dw : ax - dw / 2);
        c.fillStyle = acc;
        rr(c, dx, yT + tH + 14 * u, dw, 6 * u, 3 * u);
        c.fill();
      }
  
      // তারিখ আঁকা
      var y = yD;
      if (dp.l1) {
        if (S.dateStyle === "capsule") {
          var cxl = al === "left" ? ax : (al === "right" ? ax - capW : ax - capW / 2);
          c.save();
          rr(c, cxl, y, capW, capH, capH / 2);
          c.fillStyle = hexA(S.capColor, 0.88);
          c.fill();
          c.lineWidth = 3 * u;
          c.strokeStyle = acc;
          c.stroke();
          c.restore();
          drawText(c, dp.l1, cxl + capPad, y + capH / 2 + 2 * u, capFont, "#ffffff", "left", u, null);
          y += capH + 14 * u;
        } else {
          drawText(c, dp.l1, ax, y + plainH / 2, l1Font, "#8cffa0", al, u, { shadow: true });
          y += plainH;
        }
      }
      if (dp.l2) {
        drawText(c, dp.l2, ax, y + l2H / 2, l2Font, "#ebf5eb", al, u, { shadow: true });
        y += l2H;
      }
      for (i = 0; i < dp.ex.length; i++) {
        var ef = fitFont(c, dp.ex[i], "700", 28 * u, fam(), maxW, 14 * u);
        drawText(c, dp.ex[i], ax, y + exH / 2, ef, "#ffe882", al, u, { shadow: true });
        y += exH;
      }
  
      drawBar(c, rx, ry, rw, rh, u, m, barH);
    }
  
    function hexA(hex, a) {
      var h = String(hex || "#000000").replace("#", "");
      if (h.length === 3) h = h.replace(/(.)/g, "$1$1");
      var n = parseInt(h, 16) || 0;
      return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
    }
  
    // ───────────── নিচের পট্টি ─────────────
    function drawBar(c, rx, ry, rw, rh, u, m, barH) {
      if (!S.barOn) return;
      var top = ry + rh - barH;
      c.fillStyle = S.barColor;
      c.fillRect(rx, top, rw, barH);
      c.fillStyle = S.accent;
      c.fillRect(rx, top, rw, 4 * u);
      var items = [];
      if (S.barWeb) items.push(cleanLink(valOf("dpLinkWeb") || "farmerkamol.com"));
      if (S.barFb) items.push(cleanLink(valOf("dpLinkFb") || "facebook.com/farmerkamol"));
      if (S.barYt) items.push(cleanLink(valOf("dpLinkYt") || "youtube.com/@Farmerkamol"));
      items = items.filter(Boolean);
      if (!items.length) return;
      var txt = items.join("   •   ");
      var f = fitFont(c, txt, "400", 24 * u, fam(), rw - 2 * m, 12 * u);
      drawText(c, txt, rx + rw / 2, top + barH / 2 + 3 * u, f, "#ffffff", "center", u, null);
    }
  
    // ───────────── ফ্রেম ─────────────
    function shadeHex(hex, f) {
        var h = String(hex || "#000000").replace("#", "");
        if (h.length === 3) h = h.replace(/(.)/g, "$1$1");
        var n = parseInt(h, 16) || 0;
        function ch(v) { return Math.max(0, Math.min(255, Math.round(v * f))); }
        return "rgb(" + ch((n >> 16) & 255) + "," + ch((n >> 8) & 255) + "," + ch(n & 255) + ")";
      }
    
      // বইয়ের পাতার স্তূপ: পেছনে কয়েকটা হেলানো পাতা, উপরে সোজা পাতা
      function drawPages(c, W, H, u) {
        c.fillStyle = "#ffffff";
        c.fillRect(0, 0, W, H);
        var specs = [[-2.6, 0.975, 22], [2.0, 0.985, 22], [-0.8, 0.995, 22], [0, 1, 26]];
        specs.forEach(function (sp) {
          var inset = sp[2] * u;
          c.save();
          c.translate(W / 2, H / 2);
          c.rotate(sp[0] * Math.PI / 180);
          c.translate(-W / 2, -H / 2);
          c.shadowColor = "rgba(0,0,0,.28)";
          c.shadowBlur = 10 * u;
          c.shadowOffsetY = 5 * u;
          rr(c, inset, inset, W - 2 * inset, H - 2 * inset, 10 * u);
          c.fillStyle = shadeHex(S.frameColor, sp[1]);
          c.fill();
          c.shadowColor = "transparent";
          c.lineWidth = 2 * u;
          c.strokeStyle = "rgba(160,140,95,.45)";
          c.stroke();
          // পাতার ধারের সরু দাগ
          c.lineWidth = 1 * u;
          c.strokeStyle = "rgba(160,140,95,.35)";
          for (var q = 1; q <= 3; q++) {
            c.beginPath();
            c.moveTo(inset + 6 * u, H - inset - q * 3 * u);
            c.lineTo(W - inset - 6 * u, H - inset - q * 3 * u);
            c.stroke();
          }
          c.restore();
        });
      }
    
      function drawFrameBg(c, W, H, u) {
      var t = S.frame;
      if (t === "none") return;
    if (t === "pages") { drawPages(c, W, H, u); return; }
      if (t === "cream") {
        c.fillStyle = "#0e3e20";
        c.fillRect(0, 0, W, H);
        c.save();
        c.shadowColor = "rgba(0,0,0,.55)";
        c.shadowBlur = 24 * u;
        c.shadowOffsetY = 8 * u;
        rr(c, 20 * u, 20 * u, W - 40 * u, H - 40 * u, 34 * u);
        c.fillStyle = S.frameColor;
        c.fill();
        c.restore();
      } else {
        c.fillStyle = S.frameColor;
        c.fillRect(0, 0, W, H);
      }
    }
  
    function drawFrameDeco(c, W, H, u, rx, ry, rw, rh) {
        var t = S.frame, acc = S.accent, i;
        if (t === "pages") {
          c.lineWidth = 3 * u;
          c.strokeStyle = acc;
          rr(c, rx - 7 * u, ry - 7 * u, rw + 14 * u, rh + 14 * u, 18 * u);
          c.stroke();
          return;
        }
      if (t === "cream") {
        c.lineWidth = 3 * u;
        c.strokeStyle = acc;
        rr(c, rx - 9 * u, ry - 9 * u, rw + 18 * u, rh + 18 * u, 20 * u);
        c.stroke();
      } else if (t === "green") {
        var b = FRAMES.green.b * u;
        c.strokeStyle = acc;
        c.lineWidth = 4 * u;
        rr(c, 10 * u, 10 * u, W - 20 * u, H - 20 * u, 30 * u); c.stroke();
        c.lineWidth = 3 * u;
        rr(c, rx - 8 * u, ry - 8 * u, rw + 16 * u, rh + 16 * u, 28 * u); c.stroke();
        var corners = [[b / 2, b / 2], [W - b / 2, b / 2], [b / 2, H - b / 2], [W - b / 2, H - b / 2]];
        corners.forEach(function (p) { diamond(c, p[0], p[1], 11 * u, acc); });
        var nx = 11, ny = 14;
        for (i = 1; i <= nx; i++) {
          var x = b + i * (W - 2 * b) / (nx + 1);
          diamond(c, x, b / 2, 4 * u, acc); diamond(c, x, H - b / 2, 4 * u, acc);
        }
        for (i = 1; i <= ny; i++) {
          var y = b + i * (H - 2 * b) / (ny + 1);
          diamond(c, b / 2, y, 4 * u, acc); diamond(c, W - b / 2, y, 4 * u, acc);
        }
      } else if (t === "nokshi") {
        var bb = FRAMES.nokshi.b * u, mid = bb / 2 - 1 * u, step = 46 * u;
        c.strokeStyle = acc;
        c.lineWidth = 4 * u;
        c.strokeRect(9 * u, 9 * u, W - 18 * u, H - 18 * u);
        c.strokeRect(rx - 9 * u, ry - 9 * u, rw + 18 * u, rh + 18 * u);
        c.lineWidth = 2 * u;
        c.strokeStyle = hexA(acc, 0.55);
        c.strokeRect(rx - 17 * u, ry - 17 * u, rw + 34 * u, rh + 34 * u);
        var chain = function (a0, a1, fixed, horiz) {
          var n = Math.max(1, Math.floor((a1 - a0) / step));
          for (var j = 0; j <= n; j++) {
            var p = a0 + j * (a1 - a0) / n;
            var px = horiz ? p : fixed, py = horiz ? fixed : p;
            diamond(c, px, py, 12 * u, acc);
            diamond(c, px, py, 5 * u, S.frameColor);
            if (j < n) {
              var q = p + (a1 - a0) / n / 2;
              c.fillStyle = "#ffe882";
              c.beginPath();
              c.arc(horiz ? q : fixed, horiz ? fixed : q, 4 * u, 0, Math.PI * 2);
              c.fill();
            }
          }
        };
        chain(bb + 10 * u, W - bb - 10 * u, mid, true);
        chain(bb + 10 * u, W - bb - 10 * u, H - mid, true);
        chain(bb + 10 * u, H - bb - 10 * u, mid, false);
        chain(bb + 10 * u, H - bb - 10 * u, W - mid, false);
        [[mid, mid], [W - mid, mid], [mid, H - mid], [W - mid, H - mid]].forEach(function (p) {
          diamond(c, p[0], p[1], 22 * u, acc);
          diamond(c, p[0], p[1], 13 * u, S.frameColor);
          c.fillStyle = "#ffe882";
          c.beginPath(); c.arc(p[0], p[1], 6 * u, 0, Math.PI * 2); c.fill();
        });
      }
    }
  
    // ───────────── মূল রেন্ডার ─────────────
    function render(env) {
      if (!S.on) return false;
      var pc = env.canvas;
      var d = dims();
      if (pc.width !== d.w || pc.height !== d.h) { pc.width = d.w; pc.height = d.h; }
  
      // প্রিভিউ যেন বিকৃত না হয়
      pc.style.aspectRatio = d.w + " / " + d.h;
      pc.style.width = "auto";
      pc.style.maxWidth = "100%";
      pc.style.height = "auto";
      pc.style.maxHeight = "75vh";
      pc.style.margin = "0 auto";
      pc.style.objectFit = "contain";
  
      var c = pc.getContext("2d");
      window.__dpCtx = c;
      warmFont();
  
      var W = d.w, H = d.h, u = Math.min(W, H) / 1080;
      var F = FRAMES[S.frame] || FRAMES.none;
      var b = F.b * u;
      var rx = b, ry = b, rw = W - 2 * b, rh = H - 2 * b;
  
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(0, 0, W, H);
      c.shadowColor = "transparent";
  
      drawFrameBg(c, W, H, u);
  
      c.save();
      rr(c, rx, ry, rw, rh, F.r * u);
      c.clip();
      if (env.photo && env.photo.width) {
        drawPhoto(c, env.photo, rx, ry, rw, rh, env.zoom, env.ox, env.oy);
      } else {
        c.fillStyle = "#1d5a32";
        c.fillRect(rx, ry, rw, rh);
        drawText(c, "এখানে ছবি যোগ করুন", rx + rw / 2, ry + rh * 0.4, "600 " + (34 * u) + "px " + fam(), "#cfe8d5", "center", u, null);
      }
      drawShade(c, rx, ry, rw, rh);
      drawContent(c, env, rx, ry, rw, rh, u);
      c.restore();
  
      drawFrameDeco(c, W, H, u, rx, ry, rw, rh);
  
      var note = $("dpPreviewNote");
      if (note) note.textContent = "ছবির উপরে লেখা মোড · " + W + " × " + H + " px (ডাউনলোডও একই সাইজ)";
      return true;
    }
  
    function download() {
      if (!S.on) return false;
      var pc = $("dailyPostCanvas");
      if (window.dpRender) window.dpRender();
      try {
        var now = new Date();
        var ds = now.getFullYear() + "-" + ("0" + (now.getMonth() + 1)).slice(-2) + "-" + ("0" + now.getDate()).slice(-2);
        pc.toBlob(function (blob) {
          var a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = "Farmer-Kamol-Daily-Post-" + ds + ".png";
          document.body.appendChild(a);
          a.click();
          setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
        }, "image/png");
      } catch (e) {
        alert("PNG তৈরি করা যায়নি। পৃষ্ঠাটি রিফ্রেশ করে আবার চেষ্টা করুন।");
      }
      return true;
    }
  
    window.DPOverlay = {
      render: render,
      download: download,
      active: function () { return !!S.on; }
    };
  
    // ───────────── UI প্যানেল ─────────────
    var CSS =
      "#dpOvPanel{border:2px solid #176b3a;border-radius:12px;padding:10px 12px;margin-bottom:14px;background:#f1faf3}" +
      "#dpOvPanel .ov-top{display:flex;align-items:center;gap:10px;font-size:15px;font-weight:700;color:#176b3a}" +
      "#dpOvPanel details{border-top:1px solid #cfe0d3;margin-top:8px;padding-top:6px}" +
      "#dpOvPanel summary{cursor:pointer;font-weight:700;color:#176b3a;padding:6px 0}" +
      "#dpOvPanel label{display:grid;gap:4px;font-size:13px;font-weight:600;margin:8px 0}" +
      "#dpOvPanel label.ov-chk{display:flex;align-items:center;gap:8px;margin:6px 0}" +
      "#dpOvPanel input[type=checkbox]{width:auto;padding:0}" +
      "#dpOvPanel input[type=color]{width:70px;height:36px;padding:2px}" +
      "#dpOvPanel input[type=range]{padding:0}" +
      "#dpOvPanel .ov-row{display:flex;gap:10px;flex-wrap:wrap}" +
      "#dpOvPanel .ov-row>label{flex:1 1 120px}" +
      "#dpOvPanel .ov-hint{font-size:12px;color:#647568;line-height:1.6;margin:4px 0}" +
      "#dpOvPanel .ov-btns{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}";
  
    function optHtml(opts, cur) {
      return opts.map(function (o) {
        return '<option value="' + o[0] + '"' + (String(cur) === o[0] ? " selected" : "") + ">" + o[1] + "</option>";
      }).join("");
    }
    function fSel(k, l, opts) { return '<label>' + l + '<select data-k="' + k + '">' + optHtml(opts, S[k]) + "</select></label>"; }
    function fRange(k, l, min, max, step) {
      return '<label>' + l + ' <b data-v="' + k + '">' + S[k] + '</b><input type="range" data-k="' + k + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + S[k] + '"></label>';
    }
    function fColor(k, l) { return '<label>' + l + '<input type="color" data-k="' + k + '" value="' + S[k] + '"></label>'; }
    function fChk(k, l) { return '<label class="ov-chk"><input type="checkbox" data-k="' + k + '"' + (S[k] ? " checked" : "") + "> " + l + "</label>"; }
    function group(title, body, open) { return "<details" + (open ? " open" : "") + "><summary>" + title + "</summary>" + body + "</details>"; }
  
    function bodyHtml() {
      var h = "";
      h += group("🖼 স্টাইল ও মাপ",
        fSel("ratio", "ছবির রেশিও (মাপ)", [
          ["4x5", "ফিড পোস্ট ৪:৫ (১০৮০×১৩৫০)"], ["1x1", "বর্গ ১:১ (১০৮০×১০৮০)"],
          ["9x16", "রিল / স্টোরি ৯:১৬ (১০৮০×১৯২০)"], ["16x9", "চওড়া ১৬:৯ (১৯২০×১০৮০)"], ["custom", "কাস্টম মাপ"]
        ]) +
        '<div class="ov-row" id="dpOvCustom" style="display:' + (S.ratio === "custom" ? "flex" : "none") + '">' +
          '<label>চওড়া (px)<input type="number" data-k="cw" min="400" max="3000" value="' + S.cw + '"></label>' +
          '<label>উচ্চতা (px)<input type="number" data-k="ch" min="400" max="3000" value="' + S.ch + '"></label></div>' +
        fSel("style", "লেখার স্টাইল", [
          ["classic", "A · ক্লাসিক (বামে, নিচে)"], ["center", "B · মাঝখানে সাজানো"], ["card", "C · নিচে সবুজ কার্ড"],
          ["top", "D · শিরোনাম উপরে, তারিখ নিচে"], ["middle", "E · মাঝ বরাবর বড়"]
        ]) +
        '<div class="ov-row">' +
        fSel("vpos", "লেখার জায়গা", [["auto", "স্টাইল অনুযায়ী"], ["top", "উপরে"], ["middle", "মাঝে"], ["bottom", "নিচে"]]) +
        fSel("align", "সাজানো", [["auto", "স্টাইল অনুযায়ী"], ["left", "বামে"], ["center", "মাঝে"], ["right", "ডানে"]]) +
        "</div>", true);
  
      h += group("✍ শিরোনাম",
        '<label>শিরোনাম (Enter দিলে নতুন লাইন)<textarea data-k="title" rows="3" placeholder="যেমন:\nসবুজ মাঠে\nসোনালি স্বপ্ন"></textarea></label>' +
        '<div class="ov-hint">প্রথম লাইনের রঙ = রঙ ১, বাকি লাইনের রঙ = রঙ ২। দুটো একই রাখলে সব লাইন এক রঙ।</div>' +
        '<div class="ov-row">' + fColor("tColor1", "রঙ ১") + fColor("tColor2", "রঙ ২") + "</div>" +
        '<div class="ov-row">' +
        fSel("tFont", "ফন্ট", [["Hind Siliguri", "হিন্দ সিলিগুড়ি"], ["Noto Sans Bengali", "নোটো সান্স বাংলা"], ["Anek Bangla", "অনেক বাংলা"], ["Li Shadhinata", "লি স্বাধীনতা"]]) +
        fSel("tWeight", "মোটা / সাধারণ", [["700", "মোটা"], ["400", "সাধারণ"]]) + "</div>" +
        fRange("tSize", "আকার", 50, 170, 2) +
        fChk("tShadow", "লেখার ছায়া") + fChk("tOutline", "লেখার চারপাশে রেখা (ছবি হালকা হলে)") +
        fChk("divider", "শিরোনামের নিচে ছোট সোনালি দাগ"), true);
  
      h += group("📅 তারিখ",
        fChk("dateOn", "তারিখ দেখাও") +
        fSel("dateStyle", "তারিখের ধরন", [["capsule", "ক্যাপসুল"], ["plain", "খোলা লেখা"]]) +
        fColor("capColor", "ক্যাপসুলের জমিনের রঙ") +
        '<div class="ov-hint">তারিখের লেখা আগের মতোই উপরের ঘর (বার, বাংলা, ইংরেজি, হিজরি) থেকে আসে। হাতে বদলালে এখানেও বদলাবে।</div>' +
        fChk("showWd", "বার") + fChk("showEn", "ইংরেজি তারিখ") + fChk("showBn", "বাংলা তারিখ") + fChk("showHj", "হিজরি তারিখ") +
        fChk("showExtra", "বিশেষ নোট ১/২ (লেখা থাকলে)"), false);
  
      h += group("🧑‍🌾 লোগো",
        fChk("logoOn", "লোগো দেখাও") +
        '<div class="ov-row">' +
        fSel("logoPos", "জায়গা", [["tr", "উপরে ডানে"], ["tl", "উপরে বামে"], ["br", "নিচে ডানে"], ["bl", "নিচে বামে"]]) +
        fSel("logoShape", "আকৃতি", [["circle", "গোল"], ["round", "গোল কোণের চৌকো"], ["none", "আকৃতি ছাড়া (স্বচ্ছ লোগোর জন্য)"]]) +
        "</div>" +
        fRange("logoSize", "আকার", 60, 260, 2) +
        fChk("logoRing", "সোনালি রিং") + fChk("showName", "ব্র্যান্ডের নাম") + fChk("showSlogan", "স্লোগান") +
        '<div class="ov-btns"><label class="dp-btn dp-secondary" style="cursor:pointer;display:inline-block">অন্য লোগো দিন<input type="file" id="dpOvLogoFile" accept="image/*" style="display:none"></label>' +
        '<button type="button" class="dp-btn dp-secondary" id="dpOvLogoReset">ডিফল্ট লোগো</button></div>', false);
  
      h += group("🖼 ফ্রেম",
        fSel("frame", "ফ্রেমের ধরন", [["cream", "ক্রিম ছবির ফ্রেম (ডিফল্ট)"], ["green", "সবুজ ফ্রেম"], ["nokshi", "নকশি বর্ডার"], ["pages", "বইয়ের পাতার স্তূপ"], ["none", "ফ্রেম নেই"]]) +
        '<div class="ov-row">' + fColor("frameColor", "ফ্রেমের রঙ") + fColor("accent", "সোনালি রেখার রঙ") + "</div>", true);
  
      h += group("🎚 পট্টি ও ছায়া",
        fChk("barOn", "নিচের লিংক পট্টি") +
        fColor("barColor", "পট্টির রঙ") +
        fChk("barWeb", "ওয়েবসাইট") + fChk("barFb", "ফেসবুক") + fChk("barYt", "ইউটিউব") +
        fSel("shade", "ছায়া", [["bottom", "নিচ থেকে"], ["top", "উপর থেকে"], ["none", "নেই"]]) +
        fRange("shadeStr", "ছায়ার গাঢ়ত্ব (%)", 0, 100, 5) +
        fChk("vignette", "কিনারা হালকা গাঢ় (ভিনিয়েট)"), false);
  
      h += '<div class="ov-hint">ছবি টেনে সরান, উপরের "ছবি জুম" দিয়ে বড়-ছোট করুন (এই মোডে জুম ১-এর নিচে নামে না)।</div>';
      h += '<div class="ov-btns"><button type="button" class="dp-btn dp-secondary" id="dpOvReset">↺ সব ডিফল্টে ফেরান</button></div>';
      return h;
    }
  
    function refreshBody() {
      var body = $("dpOvBody");
      if (!body) return;
      var t = S.title;
      body.innerHTML = bodyHtml();
      var ta = body.querySelector('textarea[data-k="title"]');
      if (ta) ta.value = t;
      bindBody();
    }
  
    function rerender() { if (window.dpRender) window.dpRender(); }
  
    function onCtl(e) {
      var t = e.target;
      var k = t && t.getAttribute ? t.getAttribute("data-k") : null;
      if (!k) return;
      var v;
      if (t.type === "checkbox") v = t.checked;
      else if (t.type === "range" || t.type === "number") v = Number(t.value);
      else v = t.value;
      S[k] = v;
  
      var lab = document.querySelector('#dpOvPanel [data-v="' + k + '"]');
      if (lab) lab.textContent = v;
  
      if (k === "ratio") {
        var cu = $("dpOvCustom");
        if (cu) cu.style.display = v === "custom" ? "flex" : "none";
      }
      if (k === "frame") {
        S.frameColor = (FRAMES[v] || FRAMES.cream).main;
        var fc = document.querySelector('#dpOvPanel input[data-k="frameColor"]');
        if (fc) fc.value = S.frameColor;
      }
      if (k !== "title") save();
      rerender();
    }
  
    function bindBody() {
      var body = $("dpOvBody");
      if (!body) return;
      var lf = $("dpOvLogoFile");
      if (lf) lf.addEventListener("change", function () {
        var f = lf.files && lf.files[0];
        if (!f) return;
        var rd = new FileReader();
        rd.onload = function () {
          var im = new Image();
          im.onload = function () { S.logoImg = im; rerender(); };
          im.src = rd.result;
        };
        rd.readAsDataURL(f);
      });
      var lr = $("dpOvLogoReset");
      if (lr) lr.addEventListener("click", function () { S.logoImg = null; rerender(); });
      var rs = $("dpOvReset");
      if (rs) rs.addEventListener("click", function () {
        for (var k in DEF) S[k] = DEF[k];
        save();
        refreshBody();
        rerender();
      });
    }
  
    function restoreOriginalCanvas() {
      var pc = $("dailyPostCanvas");
      if (!pc) return;
      pc.style.aspectRatio = "";
      pc.style.width = "";
      pc.style.maxWidth = "";
      pc.style.height = "";
      pc.style.maxHeight = "";
      pc.style.margin = "";
      pc.style.objectFit = "";
      // আগের সাইজ সেটিং আবার প্রয়োগ
      var sel = $("dpSizePreset");
      var v = sel && sel.value;
      if (v === "custom" && window.dpApplyCustomSize) window.dpApplyCustomSize();
      else if (window.dpOnSizeChange) window.dpOnSizeChange();
      else rerender();
    }
  
    function setOn(on) {
      S.on = !!on;
      var body = $("dpOvBody");
      if (body) body.style.display = S.on ? "block" : "none";
      if (S.on) {
        if (!S.title) {
          var dt = valOf("dpTitle");
          if (dt && dt !== "|Farmer Kamol") {
            S.title = dt;
            var ta = document.querySelector('#dpOvPanel textarea[data-k="title"]');
            if (ta) ta.value = dt;
          }
        }
        rerender();
      } else {
        restoreOriginalCanvas();
      }
    }
  
    function buildUI() {
      var host = document.querySelector("#dailyPostStudio .dp-controls");
      if (!host || $("dpOvPanel")) return;
  
      var st = document.createElement("style");
      st.id = "dpOvCss";
      st.textContent = CSS;
      document.head.appendChild(st);
  
      var box = document.createElement("div");
      box.id = "dpOvPanel";
      box.innerHTML =
        '<label class="ov-top ov-chk" style="font-size:15px"><input type="checkbox" id="dpOvOn"> ✨ ছবির উপরে লেখা মোড (নতুন)</label>' +
        '<div class="ov-hint">চালু করলে শিরোনাম, তারিখ, লোগো ও ফ্রেম সবই ছবির উপরে বসবে। বন্ধ থাকলে আগের ডিজাইনই থাকবে।</div>' +
        '<div id="dpOvBody" style="display:none"></div>';
      host.insertBefore(box, host.firstChild);
  
      $("dpOvBody").innerHTML = bodyHtml();
      bindBody();
      box.addEventListener("input", onCtl);
      box.addEventListener("change", onCtl);
      $("dpOvOn").addEventListener("change", function (e) { setOn(e.target.checked); });
    }
  
    try { buildUI(); } catch (err) { if (window.console) console.error("DPOverlay UI error:", err); }
  })();