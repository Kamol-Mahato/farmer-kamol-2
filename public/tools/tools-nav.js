(function () {
    if (window.__fkNav) return;
    window.__fkNav = 1;
  
    var items = [
      ["🎨 থাম্বনেইল মেকার", "/tools/thumbnail-maker.html", "maker"],
      ["🌱 Daily Post", "/tools/thumbnail-maker.html#daily-post", "post"],
      ["🎞️ Daily Reel", "/tools/daily-reel.html", "reel"],
      ["🖼️ সহজ থাম্বনেইল", "/tools/thumbnail-simple.html", "simple"]
    ];
  
    function current() {
      var p = location.pathname;
      if (p.indexOf("daily-reel") > -1) return "reel";
      if (p.indexOf("thumbnail-simple") > -1) return "simple";
      return location.hash === "#daily-post" ? "post" : "maker";
    }
  
    function init() {
      var st = document.createElement("style");
      st.textContent =
        "#fkNav{position:fixed;left:12px;bottom:12px;z-index:2147483000;font-family:'Hind Siliguri','Noto Sans Bengali',sans-serif}" +
        "#fkNavBtn{width:44px;height:44px;border-radius:50%;border:0;background:#176b3a;color:#fff;font-size:20px;cursor:pointer;box-shadow:0 3px 12px rgba(0,0,0,.3)}" +
        "#fkNavMenu{display:none;position:absolute;left:0;bottom:52px;background:#fff;border-radius:12px;padding:6px;box-shadow:0 6px 24px rgba(0,0,0,.28);min-width:190px}" +
        "#fkNav.open #fkNavMenu{display:block}" +
        "#fkNavMenu a{display:block;padding:9px 12px;border-radius:8px;color:#173c27;text-decoration:none;font-size:14px;font-weight:600;white-space:nowrap}" +
        "#fkNavMenu a:hover{background:#e6f4ea}" +
        "#fkNavMenu a.on{background:#176b3a;color:#fff}";
      document.head.appendChild(st);
  
      var box = document.createElement("div");
      box.id = "fkNav";
      box.innerHTML = '<div id="fkNavMenu"></div><button id="fkNavBtn" type="button" title="টুলস মেনু">☰</button>';
      document.body.appendChild(box);
  
      function build() {
        var cur = current(), h = "";
        items.forEach(function (it) {
          h += '<a href="' + it[1] + '"' + (it[2] === cur ? ' class="on"' : "") + ">" + it[0] + "</a>";
        });
        document.getElementById("fkNavMenu").innerHTML = h;
      }
  
      document.getElementById("fkNavBtn").addEventListener("click", function (e) {
        e.stopPropagation();
        build();
        box.classList.toggle("open");
      });
      document.addEventListener("click", function () { box.classList.remove("open"); });
    }
  
    if (document.body) init();
    else document.addEventListener("DOMContentLoaded", init);
  })();