/* =====================================================================
   Farmer Kamol — Daily Post : ভিডিও (মসৃণ মোশন + ক্রমানুসারে লেখা + প্রিভিউ)
   ফাইল: public/tools/daily-post-video.js

   • "ছবির উপরে লেখা" মোড চালু থাকলে ভিডিও সেই ডিজাইনেই হবে
   • বন্ধ থাকলে লেখা ছবির নিচে/বাইরে (পুরনো ৯:১৬ লেআউট) আসবে
   • ছবিতে খুব ধীর, একই গতির জুম (ঝাঁকুনি নেই)
   • লেখা একটার পর একটা আসে; সাইজ ও গতি বদলানো যায়
   • তৈরির আগে প্রিভিউ দেখা যায়
   এই ফাইল থাম্বনেইল-মেকারের পুরনো dpGenerateVideo বদলে দেয় (পুরনো কোড মুছতে হয় না)
   ===================================================================== */
   (function () {
    "use strict";
  
    var $ = function (id) { return document.getElementById(id); };
    var KEY = "fk_dp_video";
    var busy = false;
    var FONT = "'Noto Sans Bengali','Hind Siliguri',sans-serif";
  
    // ───────── ছোট সহায়ক ─────────
    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
    function easeIO(t) { return 0.5 - 0.5 * Math.cos(Math.PI * t); }
    function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
    function val(id) { var e = $(id); return e && typeof e.value === "string" ? e.value.trim() : ""; }
    function ovOn() { return !!(window.DPOverlay && window.DPOverlay.active && window.DPOverlay.active()); }
    function st() { return window.__dpState ? window.__dpState() : null; }
  
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
  
    function fit(c, text, weight, size, maxW, minSize) {
      var s = size;
      c.font = weight + " " + s + "px " + FONT;
      while (c.measureText(text).width > maxW && s > minSize) {
        s -= 1;
        c.font = weight + " " + s + "px " + FONT;
      }
    }
  
    function wrap(c, text, maxW, maxLines) {
      var lines = [];
      String(text || "").replace(/\r/g, "").split("\n").forEach(function (p) {
        var words = p.trim().split(/\s+/).filter(Boolean), line = "";
        words.forEach(function (w) {
          var t = line ? line + " " + w : w;
          if (c.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
        });
        if (line) lines.push(line);
      });
      return maxLines ? lines.slice(0, maxLines) : lines;
    }
  
    // ───────── সেটিং ─────────
    var saved = { size: "1", step: "0.9", motion: "0.05" };
    try {
      var o = JSON.parse(localStorage.getItem(KEY) || "{}");
      for (var k in saved) if (o[k] != null) saved[k] = String(o[k]);
    } catch (e) {}
  
    function settings() {
      var q = Number(($("dpVidSize") || {}).value);
      var s = Number(($("dpVidStep") || {}).value);
      var m = Number(($("dpVidMotion") || {}).value);
      return { q: q > 0 ? q : 1, step: s > 0 ? s : 0.9, motion: m >= 0 ? m : 0.05 };
    }
  
    // ───────── সময়সূচি: কোন অংশ কখন আসবে ─────────
    var FADE = 0.8;
    function plan(keys, dur, step) {
      var first = 0.5, n = keys.length;
      var s = n > 1 ? Math.min(step, (dur * 0.8 - first - FADE) / (n - 1)) : step;
      s = Math.max(0.25, s);
      var m = {};
      keys.forEach(function (key, i) { m[key] = first + i * s; });
      return m;
    }
    function prog(t, start) { return easeIO(clamp((t - start) / FADE, 0, 1)); }
  
    // ───────── রেন্ডারার ১: ছবির উপরে লেখা মোড ─────────
    function overlayRenderer(S0, cfg) {
      var cv = document.createElement("canvas");
      var d = window.DPOverlay.size();
      cv.width = d.w; cv.height = d.h;
      var base = Math.max(1, S0.zoom || 1), ox0 = S0.ox || 0, oy0 = S0.oy || 0;
      var env = { canvas: cv, offscreen: true, photo: S0.photo, logo: S0.logo, zoom: base, ox: ox0, oy: oy0, dates: S0.dates };
      var keys = window.DPOverlay.parts(env);
      var cache = null;
      return {
        w: d.w, h: d.h, canvas: cv,
        draw: function (t, dur) {
          if (!cache || cache.dur !== dur) cache = { dur: dur, m: plan(keys, dur, cfg.step) };
          var rv = {};
          keys.forEach(function (key) { rv[key] = prog(t, cache.m[key]); });
          var p = easeIO(clamp(t / dur, 0, 1));
          env.zoom = base * (1 + cfg.motion * p);
          env.ox = ox0 + (p - 0.5) * d.w * 0.025 * (cfg.motion > 0 ? 1 : 0);
          env.oy = oy0;
          window.DPOverlay.frame(env, rv, cfg.q);
        }
      };
    }
  
    // ───────── রেন্ডারার ২: লেখা ছবির বাইরে (৯:১৬) ─────────
    function outsideRenderer(S0, cfg) {
      var W = 1080, H = 1920, pad = 36, q = cfg.q, kq = Math.max(1, q);
      var cv = document.createElement("canvas");
      cv.width = W; cv.height = H;
      var c = cv.getContext("2d");
  
      var title = val("dpTitle") || "আজকের কৃষি";
      var cards = [val("dpWeekday"), val("dpBnDate"), val("dpEnDate"), val("dpHijriDate")].filter(Boolean);
      var e1 = val("dpExtra1"), e2 = val("dpExtra2"), hasEx = !!(e1 || e2);
      var brandName = val("dpBrandName") || "Farmer Kamol";
      var brandSub = val("dpBrandSub") || "খামার থেকে আপনার দরজায়";
      var brandTag = val("dpBrandTagline");
      var brandFoot = val("dpBrandFooter") || "খামার থেকে আপনার দরজায়  •  কৃষিই প্রাণ";
      var linkFb = val("dpLinkFb") || "facebook.com/farmerkamol";
      var linkWeb = val("dpLinkWeb") || "farmerkamol.com";
      var linkYt = val("dpLinkYt") || "youtube.com/@Farmerkamol";
      var showLogo = !$("dpShowLogo") || $("dpShowLogo").checked;
      var showSocial = !$("dpShowSocial") || $("dpShowSocial").checked;
  
      // মাপ হিসাব
      c.font = "700 " + (48 * q) + "px " + FONT;
      var tLines = wrap(c, title, W - pad * 2 - 16, 4);
      var tLH = 58 * q;
      var cardW = (W - pad * 2 - 16) / 2, cardH = 78 * kq;
      var rows = Math.ceil(cards.length / 2);
      var eH = hasEx ? ((e1 && e2) ? 100 : 56) * kq : 0;
      var textH = tLines.length * tLH + 24 + rows * (cardH + 14) + (hasEx ? 14 + eH : 0);
      var footerTop = H - 420, photoY = 40, gapTop = 50;
      var photoH = clamp(footerTop - 30 - textH - gapTop - photoY, 480, 900);
      var titleTop = photoY + photoH + gapTop;
      var cardsY0 = titleTop + tLines.length * tLH + 24;
      var exY = cardsY0 + rows * (cardH + 14) + 14;
  
      var keys = ["title"];
      cards.forEach(function (_, i) { keys.push("c" + i); });
      if (hasEx) keys.push("ex");
      keys.push("footer");
      var cache = null;
  
      function begin(a, dy) {
        c.save();
        c.globalAlpha = a;
        if (dy) c.translate(0, (1 - a) * dy);
      }
  
      return {
        w: W, h: H, canvas: cv,
        draw: function (t, dur) {
          if (!cache || cache.dur !== dur) cache = { dur: dur, m: plan(keys, dur, cfg.step) };
          var m = cache.m;
          c.setTransform(1, 0, 0, 1, 0, 0);
          c.fillStyle = "#f0fbf3";
          c.fillRect(0, 0, W, H);
  
          // ছবি
          var p = easeIO(clamp(t / dur, 0, 1));
          var z = Math.max(1, S0.zoom || 1) * (1 + cfg.motion * p) ;
          var cw = W - pad * 2;
          c.save();
          rr(c, pad, photoY, cw, photoH, 18);
          c.clip();
          c.imageSmoothingEnabled = true;
          c.imageSmoothingQuality = "high";
          var ph = S0.photo;
          var cover = Math.max(cw / ph.width, photoH / ph.height) * z;
          var dw = ph.width * cover, dh = ph.height * cover;
          var maxOX = Math.max(0, (dw - cw) / 2);
          var dx = pad + (cw - dw) / 2 + (cfg.motion > 0 ? (p - 0.5) * maxOX * 0.6 : 0);
          var dy = photoY + (photoH - dh) / 2;
          c.drawImage(ph, dx, dy, dw, dh);
          c.restore();
  
          // শিরোনাম
          var a = prog(t, m.title);
          if (a > 0) {
            begin(a, 24);
            c.fillStyle = "#174b2d";
            c.font = "700 " + (48 * q) + "px " + FONT;
            c.textAlign = "left";
            c.textBaseline = "alphabetic";
            tLines.forEach(function (ln, i) { c.fillText(ln, pad + 8, titleTop + 48 * q * 0.85 + i * tLH); });
            c.restore();
          }
  
          // তারিখের কার্ড (একটার পর একটা)
          cards.forEach(function (txt, i) {
            var ca = prog(t, m["c" + i]);
            if (ca <= 0) return;
            var col = i % 2, row = Math.floor(i / 2);
            var cx = pad + col * (cardW + 16), cy = cardsY0 + row * (cardH + 14);
            begin(ca, 24);
            rr(c, cx, cy, cardW, cardH, 12);
            c.fillStyle = "#ffffff";
            c.fill();
            c.fillStyle = "#000000";
            fit(c, txt, "700", 28 * q, cardW - 24, 14);
            c.textAlign = "center";
            c.textBaseline = "middle";
            c.fillText(txt, cx + cardW / 2, cy + cardH / 2 + 2);
            c.restore();
          });
  
          // বিশেষ নোট
          if (hasEx) {
            var ea = prog(t, m.ex);
            if (ea > 0) {
              begin(ea, 24);
              rr(c, pad, exY, W - pad * 2, eH, 12);
              c.fillStyle = "#ffffff";
              c.fill();
              c.fillStyle = "#000000";
              c.textAlign = "left";
              c.textBaseline = "middle";
              var lines = [e1, e2].filter(Boolean);
              lines.forEach(function (ln, i) {
                fit(c, ln, "700", 26 * q, W - pad * 2 - 44, 13);
                c.fillText(ln, pad + 22, exY + eH * (i + 1) / (lines.length + 1));
              });
              c.restore();
            }
          }
  
          // ফুটার
          var fa = prog(t, m.footer);
          if (fa > 0) drawFooter(fa);
        }
      };
  
      function drawFooter(fa) {
        var fy = footerTop;
        begin(fa, 50);
        c.fillStyle = "#e1f3e6";
        c.fillRect(0, fy, W, H - fy);
        var logo = S0.logo;
        if (showLogo && logo && logo.complete && logo.naturalWidth) {
          c.save();
          c.beginPath();
          c.arc(pad + 50, fy + 55, 36, 0, Math.PI * 2);
          c.clip();
          c.drawImage(logo, pad + 14, fy + 19, 72, 72);
          c.restore();
        }
        c.textBaseline = "alphabetic";
        c.textAlign = "left";
        c.fillStyle = "#07552c";
        c.font = "700 32px Arial, sans-serif";
        c.fillText(brandName, pad + 100, fy + 45);
        c.fillStyle = "#df5c17";
        c.font = "700 24px " + FONT;
        c.fillText(brandSub, pad + 100, fy + 78);
        c.fillStyle = "#294c34";
        c.font = "400 18px " + FONT;
        c.fillText(brandTag, pad + 100, fy + 108, W - pad * 2 - 120);
  
        if (showSocial) {
          var socials = [
            { x: W * 0.22, color: "#1877f2", kind: "fb", label: linkFb },
            { x: W * 0.5, color: "#2b6cb0", kind: "web", label: linkWeb },
            { x: W * 0.78, color: "#ff0000", kind: "yt", label: linkYt }
          ];
          var sy = fy + 175;
          socials.forEach(function (s) {
            c.fillStyle = s.color;
            c.beginPath();
            c.arc(s.x, sy, 26, 0, Math.PI * 2);
            c.fill();
            c.fillStyle = "#fff";
            c.textAlign = "center";
            c.textBaseline = "middle";
            if (s.kind === "fb") { c.font = "700 30px Arial"; c.fillText("f", s.x, sy + 1); }
            else if (s.kind === "yt") {
              c.beginPath();
              c.moveTo(s.x - 7, sy - 9); c.lineTo(s.x - 7, sy + 9); c.lineTo(s.x + 11, sy);
              c.closePath();
              c.fill();
            } else { c.font = "700 20px Arial"; c.fillText("🌐", s.x, sy + 1); }
            c.fillStyle = "#1a1a1a";
            c.font = "600 18px Arial";
            c.textBaseline = "alphabetic";
            c.fillText(s.label, s.x, sy + 48);
          });
        }
        c.fillStyle = "#647768";
        c.font = "700 16px " + FONT;
        c.textAlign = "center";
        c.textBaseline = "alphabetic";
        c.fillText(brandFoot, W / 2, fy + 270);
        c.restore();
      }
    }
  
    function build() {
      var S0 = st();
      if (!S0 || !S0.photo) return null;
      var cfg = settings();
      return ovOn() ? overlayRenderer(S0, cfg) : outsideRenderer(S0, cfg);
    }
  
    function loadFonts() {
      if (!document.fonts || !document.fonts.load) return Promise.resolve();
      var list = ["700 40px 'Noto Sans Bengali'", "400 24px 'Noto Sans Bengali'", "700 40px 'Hind Siliguri'", "400 24px 'Hind Siliguri'"];
      return Promise.all(list.map(function (f) {
        return document.fonts.load(f, "অআকখ").catch(function () {});
      })).catch(function () {});
    }
  
    function duration() { return Number(($("dpVideoDuration") || {}).value) || 15; }
  
    // ───────── প্রিভিউ ─────────
    var prev = null;
    function closePreview() {
      if (!prev) return;
      prev.stop = true;
      cancelAnimationFrame(prev.raf);
      document.removeEventListener("keydown", prev.onKey);
      if (prev.box.parentNode) prev.box.parentNode.removeChild(prev.box);
      prev = null;
    }
  
    async function openPreview() {
      var S0 = st();
      if (!S0 || !S0.photo) { alert("আগে একটি ছবি অ্যাড করুন।"); return; }
      closePreview();
      await loadFonts();
      var R = build(), dur = duration();
      R.draw(0, dur);
      await sleep(60);
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
  
      var box = document.createElement("div");
      box.style.cssText = "position:fixed;inset:0;z-index:2147483100;background:rgba(0,0,0,.9);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:10px;font-family:'Hind Siliguri','Noto Sans Bengali',sans-serif";
      var cvs = document.createElement("canvas");
      cvs.width = R.w; cvs.height = R.h;
      cvs.style.cssText = "max-width:94vw;max-height:78vh;width:auto;height:auto;aspect-ratio:" + R.w + "/" + R.h + ";background:#000;border-radius:8px";
      var bar = document.createElement("div");
      bar.style.cssText = "display:flex;align-items:center;gap:10px;width:min(94vw,520px);color:#fff;font-size:14px";
      var play = document.createElement("button");
      var slider = document.createElement("input");
      var lab = document.createElement("span");
      var close = document.createElement("button");
      [play, close].forEach(function (b) {
        b.type = "button";
        b.style.cssText = "border:0;border-radius:8px;padding:8px 12px;font:inherit;font-weight:700;cursor:pointer;background:#fff;color:#176b3a";
      });
      close.textContent = "✕ বন্ধ";
      slider.type = "range"; slider.min = 0; slider.max = 1000; slider.value = 0;
      slider.style.cssText = "flex:1;min-width:0";
      lab.style.cssText = "min-width:70px;text-align:right";
      bar.appendChild(play); bar.appendChild(slider); bar.appendChild(lab); bar.appendChild(close);
      box.appendChild(cvs); box.appendChild(bar);
      document.body.appendChild(box);
  
      var pc = cvs.getContext("2d");
      var P = { box: box, stop: false, raf: 0, t: 0, playing: true, last: 0 };
      P.onKey = function (e) { if (e.key === "Escape") closePreview(); };
      document.addEventListener("keydown", P.onKey);
      prev = P;
  
      function show() {
        R.draw(P.t, dur);
        pc.drawImage(R.canvas, 0, 0, cvs.width, cvs.height);
        slider.value = Math.round(P.t / dur * 1000);
        lab.textContent = P.t.toFixed(1) + " / " + dur + "s";
        play.textContent = P.playing ? "⏸ থামান" : "▶ চালান";
      }
      function tick(now) {
        if (P.stop) return;
        if (P.playing) {
          P.t += Math.min(0.1, (now - P.last) / 1000);
          if (P.t >= dur) P.t = 0;
          show();
        }
        P.last = now;
        P.raf = requestAnimationFrame(tick);
      }
      play.onclick = function () { P.playing = !P.playing; show(); };
      slider.oninput = function () { P.t = Number(slider.value) / 1000 * dur; P.playing = false; show(); };
      close.onclick = closePreview;
      show();
      P.last = performance.now();
      P.raf = requestAnimationFrame(tick);
    }
  
    // ───────── ভিডিও তৈরি ─────────
    async function generate() {
      if (busy) return;
      var S0 = st();
      if (!S0 || !S0.photo) { alert("আগে একটি ছবি অ্যাড করুন।"); return; }
      closePreview();
  
      var dur = duration(), fps = 30;
      var status = $("dpVideoStatus");
      var btns = [$("dpMakeVideoBtn"), $("dpMakeVideoBtnHeader")].filter(Boolean);
      busy = true;
      btns.forEach(function (b) { b.disabled = true; });
      status.textContent = "⏳ ভিডিও তৈরি হচ্ছে... ০%  (ট্যাব খোলা রাখুন)";
  
      var audioCtx = null, audioDest = null, music = null;
      try {
        // অডিও আগে বানাই (ক্লিকের অনুমতি থাকতে থাকতে)
        if (S0.music) {
          try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (audioCtx.resume) await audioCtx.resume();
            audioDest = audioCtx.createMediaStreamDestination();
          } catch (e) { audioCtx = null; audioDest = null; }
        }
  
        await loadFonts();
        var R = build();
        R.draw(0, dur);
        await sleep(60);
        if (document.fonts && document.fonts.ready) await document.fonts.ready;
        R.draw(0, dur);
  
        var stream = R.canvas.captureStream(fps);
        if (audioDest) {
          stream = new MediaStream(stream.getVideoTracks().concat(audioDest.stream.getAudioTracks()));
        }
        var mime = "video/webm", ext = "webm";
        if (MediaRecorder.isTypeSupported("video/mp4")) { mime = "video/mp4"; ext = "mp4"; }
        else if (MediaRecorder.isTypeSupported("video/mp4;codecs=avc1")) { mime = "video/mp4;codecs=avc1"; ext = "mp4"; }
        else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) { mime = "video/webm;codecs=vp9"; }
        else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8")) { mime = "video/webm;codecs=vp8"; }
  
        var rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8000000 });
        var chunks = [];
        rec.ondataavailable = function (e) { if (e.data && e.data.size > 0) chunks.push(e.data); };
        var stopped = new Promise(function (res) { rec.onstop = res; });
  
        rec.start();
        var t0 = performance.now();
        if (audioCtx && audioDest) {
          music = audioCtx.createBufferSource();
          music.buffer = S0.music;
          var gain = audioCtx.createGain();
          var vol = Number(($("dpMusicVol") || {}).value);
          vol = vol > 0 ? vol : 0.6;
          var now = audioCtx.currentTime;
          gain.gain.setValueAtTime(vol, now);
          gain.gain.setValueAtTime(vol, now + Math.max(0, dur - 1.5));
          gain.gain.linearRampToValueAtTime(0, now + dur);
          music.connect(gain); gain.connect(audioDest);
          music.start(0);
        }
  
        await new Promise(function (resolve) {
          var lastPct = -1;
          (function tick() {
            var t = (performance.now() - t0) / 1000;
            if (t >= dur) { R.draw(dur, dur); resolve(); return; }
            R.draw(t, dur);
            var pct = Math.floor(t / dur * 100);
            if (pct !== lastPct) {
              lastPct = pct;
              status.textContent = "⏳ ভিডিও তৈরি হচ্ছে... " + pct + "%  (ট্যাব খোলা রাখুন)";
            }
            requestAnimationFrame(tick);
          })();
        });
  
        await sleep(400);
        if (music) { try { music.stop(); } catch (e) {} }
        rec.stop();
        await stopped;
        if (audioCtx) { try { audioCtx.close(); } catch (e) {} }
  
        var blob = new Blob(chunks, { type: mime });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "Farmer-Kamol-Daily-" + Date.now() + "." + ext;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 5000);
  
        status.textContent = ext === "mp4"
          ? "✅ MP4 ভিডিও তৈরি হয়েছে ও ডাউনলোড শুরু হয়েছে! (Facebook এ আপলোড করা যাবে)"
          : "✅ WebM ভিডিও তৈরি হয়েছে। এই ব্রাউজারে MP4 সাপোর্ট নেই। Chrome/Edge এ চেষ্টা করুন অথবা অনলাইন কনভার্টার ব্যবহার করুন।";
      } catch (err) {
        console.error("Video generation error:", err);
        status.textContent = "❌ ভিডিও তৈরি ব্যর্থ হয়েছে। আবার চেষ্টা করুন।";
        alert("ভিডিও তৈরি করতে সমস্যা হয়েছে: " + (err && err.message ? err.message : err));
        if (audioCtx) { try { audioCtx.close(); } catch (e) {} }
      } finally {
        busy = false;
        btns.forEach(function (b) { b.disabled = false; });
      }
    }
  
    // ───────── সেটিং প্যানেল (ভিডিও বাটনের ঠিক উপরে) ─────────
    function selHtml(id, label, opts) {
      return "<label>" + label + '<select id="' + id + '">' +
        opts.map(function (x) { return '<option value="' + x[0] + '">' + x[1] + "</option>"; }).join("") +
        "</select></label>";
    }
  
    function injectUI() {
      var btn = $("dpMakeVideoBtn");
      if (!btn || $("dpVidPanel")) return;
      var box = document.createElement("div");
      box.id = "dpVidPanel";
      box.style.cssText = "margin:8px 0;padding:10px;border:1px solid #cfe0d3;border-radius:10px;background:#f6fbf7";
      box.innerHTML =
        '<div style="font-weight:700;color:#176b3a;margin-bottom:4px">🎞️ ভিডিও সেটিং</div>' +
        selHtml("dpVidSize", "লেখার সাইজ", [["0.9", "ছোট"], ["1", "মাঝারি"], ["1.25", "বড়"], ["1.5", "অনেক বড়"]]) +
        selHtml("dpVidStep", "লেখা আসার গতি (একটার পর একটা)", [["0.6", "দ্রুত"], ["0.9", "মাঝারি"], ["1.4", "ধীর"]]) +
        selHtml("dpVidMotion", "ছবির নড়াচড়া", [["0", "নেই"], ["0.03", "খুব হালকা"], ["0.05", "হালকা"], ["0.08", "একটু বেশি"]]) +
        '<button type="button" class="dp-btn dp-secondary" id="dpVidPrevBtn" style="width:100%;margin-top:8px">👁 ভিডিও প্রিভিউ দেখুন</button>' +
        '<div class="dp-note" style="margin-top:6px">"ছবির উপরে লেখা" চালু থাকলে ভিডিও সেই ডিজাইনে হবে, বন্ধ থাকলে লেখা ছবির নিচে আসবে। ভিডিও তৈরির সময় এই ট্যাব খোলা রাখুন।</div>';
      btn.parentNode.insertBefore(box, btn);
  
      $("dpVidSize").value = saved.size;
      $("dpVidStep").value = saved.step;
      $("dpVidMotion").value = saved.motion;
      ["dpVidSize", "dpVidStep", "dpVidMotion"].forEach(function (id) {
        $(id).addEventListener("change", function () {
          try {
            localStorage.setItem(KEY, JSON.stringify({
              size: $("dpVidSize").value, step: $("dpVidStep").value, motion: $("dpVidMotion").value
            }));
          } catch (e) {}
        });
      });
      $("dpVidPrevBtn").addEventListener("click", function () { openPreview(); });
    }
  
    window.dpGenerateVideo = generate;
    window.dpPreviewVideo = openPreview;
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", injectUI);
    else injectUI();
  })();