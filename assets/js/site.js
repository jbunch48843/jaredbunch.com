/* jaredbunch.com — shared page behavior.
   Every feature checks for its own markup, so one script serves every page.
   Pages in a subfolder set <body data-root="../"> so links resolve. */
(function () {
  "use strict";

  var ROOT = document.body.getAttribute("data-root") || "";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Everything the jump menu (⌘K) can open ---------- */
  var JUMP_ITEMS = [
    ["Home", "Page", "index.html"],
    ["Work", "Page", "work.html"],
    ["About", "Page", "mystory.html"],
    ["Leadership & coaching", "About", "mystory.html#leadership"],
    ["Notes", "Page", "notes.html"],
    ["Drawing Automation", "Case study", "Drawing-Automation.html"],
    ["Factory Design Vision", "Case study", "factory-design.html"],
    ["Process Analysis", "Case study", "processanalysis.html"],
    ["Fair Play Lineup", "Case study", "fairplayengine.html"],
    ["Private work", "Password", "private/"],
    ["Email Jared", "Action", "mailto:jared.bunch@outlook.com"],
    ["Resume (PDF)", "Action", "assets/jaredbunch_resume.pdf"],
    ["LinkedIn", "Action", "https://www.linkedin.com/in/jaredabunch"]
  ];

  function resolve(href) {
    return /^(https?:|mailto:|#)/.test(href) ? href : ROOT + href;
  }

  /* ---------- Command palette ---------- */
  function initPalette() {
    var box = document.createElement("div");
    box.className = "cmdk";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Jump to");
    box.innerHTML =
      '<div class="cmdk-box">' +
      '<input type="text" placeholder="Search pages, case studies and actions…" autocomplete="off" aria-label="Search" aria-controls="cmdk-list">' +
      '<ul id="cmdk-list" role="listbox"></ul>' +
      '<div class="cmdk-foot"><span><kbd>↑</kbd> <kbd>↓</kbd> to move</span><span><kbd>↵</kbd> to open</span><span><kbd>esc</kbd> to close</span></div>' +
      "</div>";
    document.body.appendChild(box);
    var input = box.querySelector("input");
    var list = box.querySelector("ul");
    var shown = [], sel = 0, last = null;

    function render() {
      var q = input.value.trim().toLowerCase();
      shown = JUMP_ITEMS.filter(function (i) { return (i[0] + " " + i[1]).toLowerCase().indexOf(q) !== -1; });
      sel = Math.min(sel, Math.max(0, shown.length - 1));
      list.innerHTML = shown.length
        ? shown.map(function (i, n) {
            return '<li role="option" id="cmdk-' + n + '" aria-selected="' + (n === sel) + '" data-n="' + n + '">' + i[0] + "<small>" + i[1] + "</small></li>";
          }).join("")
        : '<li class="empty">No matches</li>';
      input.setAttribute("aria-activedescendant", shown.length ? "cmdk-" + sel : "");
      var cur = list.querySelector('[aria-selected="true"]');
      if (cur) cur.scrollIntoView({ block: "nearest" });
    }
    function go(item) {
      if (!item) return;
      close();
      var href = resolve(item[2]);
      if (/^https?:|\.pdf$/.test(href)) window.open(href, "_blank", "noopener");
      else window.location.href = href;
    }
    function open() {
      last = document.activeElement;
      box.classList.add("open");
      input.value = "";
      sel = 0;
      render();
      input.focus();
    }
    function close() {
      box.classList.remove("open");
      if (last && last.focus) last.focus();
    }

    document.querySelectorAll("[data-cmdk]").forEach(function (b) { b.addEventListener("click", open); });
    window.addEventListener("keydown", function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (box.classList.contains("open")) close(); else open();
        return;
      }
      if (!box.classList.contains("open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowDown" && shown.length) { e.preventDefault(); sel = (sel + 1) % shown.length; render(); }
      else if (e.key === "ArrowUp" && shown.length) { e.preventDefault(); sel = (sel - 1 + shown.length) % shown.length; render(); }
      else if (e.key === "Enter") { e.preventDefault(); go(shown[sel]); }
    });
    input.addEventListener("input", function () { sel = 0; render(); });
    list.addEventListener("click", function (e) {
      var li = e.target.closest("li[data-n]");
      if (li) go(shown[+li.getAttribute("data-n")]);
    });
    box.addEventListener("click", function (e) { if (e.target === box) close(); });
  }

  /* ---------- Scroll progress bar ---------- */
  function initProgress() {
    var bar = document.querySelector(".progress-bar");
    if (!bar) return;
    function update() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
    }
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  /* ---------- Tabs: any [role=tablist] followed by its panels ---------- */
  function initTabs() {
    document.querySelectorAll("[data-tabs]").forEach(function (group) {
      var tabs = Array.prototype.slice.call(group.querySelectorAll('[role="tab"]'));
      var panels = Array.prototype.slice.call(group.querySelectorAll('[role="tabpanel"]'));
      function select(i, focus) {
        tabs.forEach(function (t, j) {
          t.setAttribute("aria-selected", String(i === j));
          t.tabIndex = i === j ? 0 : -1;
        });
        panels.forEach(function (p, j) { p.hidden = i !== j; });
        if (focus) tabs[i].focus();
      }
      tabs.forEach(function (t, i) {
        t.addEventListener("click", function () { select(i); });
        t.addEventListener("keydown", function (e) {
          var vertical = group.classList.contains("vtabs");
          var next = vertical ? "ArrowDown" : "ArrowRight", prev = vertical ? "ArrowUp" : "ArrowLeft";
          if (e.key === next) { e.preventDefault(); select((i + 1) % tabs.length, true); }
          if (e.key === prev) { e.preventDefault(); select((i - 1 + tabs.length) % tabs.length, true); }
        });
      });
      select(0);
    });
  }

  /* ---------- Lightbox: img.zoomable and video.zoomable ---------- */
  function initLightbox() {
    var box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Enlarged view");
    box.innerHTML = '<button class="lightbox-close" type="button" aria-label="Close">&times;</button><figure><div class="lb-media"></div><figcaption></figcaption></figure>';
    document.body.appendChild(box);
    var media = box.querySelector(".lb-media");
    var cap = box.querySelector("figcaption");
    var closeBtn = box.querySelector(".lightbox-close");
    var lastFocus = null;

    function open(el) {
      lastFocus = document.activeElement;
      var label = el.getAttribute("aria-label") || el.getAttribute("alt") || "";
      if (el.tagName === "VIDEO") {
        var src = el.currentSrc || (el.querySelector("source") || {}).src;
        media.innerHTML = '<video controls autoplay loop muted playsinline></video>';
        media.firstChild.src = src;
      } else {
        media.innerHTML = "<img alt=\"\">";
        media.firstChild.src = el.currentSrc || el.src;
        media.firstChild.alt = label;
      }
      cap.textContent = label;
      box.classList.add("is-open");
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    }
    function close() {
      box.classList.remove("is-open");
      media.innerHTML = "";
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    }

    document.addEventListener("click", function (e) {
      var t = e.target.closest(".zoomable");
      if (t && !box.contains(t)) open(t);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && box.classList.contains("is-open")) close();
      var t = e.target.closest && e.target.closest(".zoomable");
      if (t && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); open(t); }
    });
    box.addEventListener("click", function (e) { if (e.target === box || e.target === closeBtn) close(); });
    document.querySelectorAll(".zoomable").forEach(function (el) {
      el.setAttribute("tabindex", "0");
      el.setAttribute("role", "button");
    });
  }

  /* ---------- Galleries: [data-gallery] with thumb buttons (data-video for clips) ---------- */
  function initGalleries() {
    document.querySelectorAll("[data-gallery]").forEach(function (g) {
      var img = g.querySelector(".gallery-stage img");
      var vid = g.querySelector(".gallery-stage video");
      var caption = g.querySelector(".gallery-caption span");
      var count = g.querySelector(".gallery-caption .mono");
      var thumbs = Array.prototype.slice.call(g.querySelectorAll(".gallery-thumbs button"));
      var index = 0;
      function show(i) {
        index = (i + thumbs.length) % thumbs.length;
        var b = thumbs[index], t = b.querySelector("img"), video = b.getAttribute("data-video");
        if (video && vid) {
          img.hidden = true; vid.hidden = false;
          vid.setAttribute("aria-label", t.alt);
          if (vid.getAttribute("src") !== video) { vid.src = video; vid.load(); }
          if (reduceMotion) vid.setAttribute("controls", "");
          else vid.play().catch(function () {
            vid.addEventListener("canplay", function () { vid.play().catch(function () {}); }, { once: true });
          });
        } else {
          if (vid) { vid.pause(); vid.hidden = true; }
          img.hidden = false; img.src = t.src; img.alt = t.alt;
        }
        caption.textContent = t.alt;
        count.textContent = (index + 1) + " / " + thumbs.length;
        thumbs.forEach(function (x, j) { x.setAttribute("aria-current", j === index ? "true" : "false"); });
      }
      thumbs.forEach(function (b, j) { b.addEventListener("click", function () { show(j); }); });
      g.querySelector(".gallery-btn--prev").addEventListener("click", function () { show(index - 1); });
      g.querySelector(".gallery-btn--next").addEventListener("click", function () { show(index + 1); });
      show(0);
    });
  }

  /* ---------- Respect reduced motion for autoplaying clips ---------- */
  function initVideos() {
    if (!reduceMotion) return;
    document.querySelectorAll("video[autoplay]").forEach(function (v) {
      v.removeAttribute("autoplay");
      v.pause();
      v.setAttribute("controls", "");
    });
  }

  /* ---------- Sidebar table of contents ---------- */
  function initToc() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".toc a"));
    if (!links.length || !("IntersectionObserver" in window)) return;
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove("is-active"); });
        var a = byId[entry.target.id];
        if (a) a.classList.add("is-active");
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    Object.keys(byId).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) obs.observe(el);
    });
  }

  /* ---------- Home: sticky number that counts up per chapter ---------- */
  function initChapters() {
    var num = document.getElementById("story-num");
    if (!num) return;
    var label = document.getElementById("story-label");
    var dots = Array.prototype.slice.call(document.querySelectorAll(".story .dots i"));
    var chapters = Array.prototype.slice.call(document.querySelectorAll(".chapter"));
    var active = -1, raf;
    function fmt(v, c) {
      var d = c.getAttribute("data-dec");
      return (c.getAttribute("data-prefix") || "") + (d ? v.toFixed(+d) : Math.round(v).toLocaleString("en-US")) + (c.getAttribute("data-suffix") || "");
    }
    function activate(i) {
      if (i === active) return;
      active = i;
      var c = chapters[i], to = parseFloat(c.getAttribute("data-num"));
      label.textContent = c.getAttribute("data-label");
      dots.forEach(function (d, j) { d.classList.toggle("on", j === i); });
      cancelAnimationFrame(raf);
      if (reduceMotion) { num.textContent = fmt(to, c); return; }
      var t0 = performance.now(), dur = 900;
      (function step(t) {
        var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        num.textContent = fmt(to * e, c);
        if (p < 1) raf = requestAnimationFrame(step);
      })(t0);
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) activate(chapters.indexOf(e.target)); });
    }, { rootMargin: "-45% 0px -45% 0px" });
    chapters.forEach(function (c) { io.observe(c); });
  }

  /* ---------- Home: pinned rail that scrolls sideways ---------- */
  function initRail() {
    var sec = document.querySelector(".rail-section");
    if (!sec) return;
    var rail = sec.querySelector(".rail"), prog = sec.querySelector(".rail-progress i");
    var pinnedQuery = window.matchMedia("(min-width: 861px) and (pointer: fine)");
    var dist = 0;
    function pinned() { return !reduceMotion && pinnedQuery.matches; }
    function layout() {
      if (!pinned()) { sec.classList.add("is-native"); sec.style.height = ""; rail.style.transform = ""; return; }
      sec.classList.remove("is-native");
      dist = Math.max(0, rail.scrollWidth - window.innerWidth + 64);
      sec.style.height = (window.innerHeight + dist) + "px";
      update();
    }
    function update() {
      if (!pinned()) return;
      var r = sec.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, -r.top / ((sec.offsetHeight - window.innerHeight) || 1)));
      rail.style.transform = "translateX(" + (-p * dist) + "px)";
      prog.style.transform = "scaleX(" + p + ")";
    }
    window.addEventListener("resize", layout);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("load", layout);
    layout();
  }

  /* ---------- Home: approach line that fills while scrolling ---------- */
  function initStepsLine() {
    var wrap = document.querySelector(".steps-line");
    if (!wrap) return;
    var fill = wrap.querySelector(".fill"), items = Array.prototype.slice.call(wrap.querySelectorAll(".step"));
    function update() {
      var r = wrap.getBoundingClientRect(), mid = window.innerHeight * 0.6;
      fill.style.height = Math.min(r.height - 12, Math.max(0, mid - r.top)) + "px";
      items.forEach(function (s) { s.classList.toggle("on", s.getBoundingClientRect().top < mid); });
    }
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  /* ---------- Testimonials (data lives in assets/testimonials.js) ---------- */
  function initTestimonials() {
    var target = document.getElementById("testimonial-stack");
    if (!target || typeof testimonialData === "undefined") return;
    target.innerHTML = testimonialData.map(function (t, i) {
      return '<figure class="quote-card" style="top:' + (96 + i * 14) + 'px">' +
        "<blockquote>“" + t.quote + "”</blockquote>" +
        '<figcaption><img src="' + ROOT + t.image + '" alt="" loading="lazy">' +
        '<div><span class="who">' + t.name + '</span><span class="role">' + t.title + " · " + t.company + "</span></div>" +
        "</figcaption></figure>";
    }).join("");
  }

  /* ---------- Filters: [data-filter-group] buttons toggle [data-tags] items ---------- */
  function initFilters() {
    document.querySelectorAll("[data-filter-group]").forEach(function (group) {
      var buttons = group.querySelectorAll("button[data-filter]");
      var items = document.querySelectorAll(group.getAttribute("data-filter-group"));
      buttons.forEach(function (b) {
        b.addEventListener("click", function () {
          var f = b.getAttribute("data-filter");
          buttons.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
          items.forEach(function (it) {
            it.hidden = f !== "all" && it.getAttribute("data-tags").split(" ").indexOf(f) === -1;
          });
        });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initPalette();
    initProgress();
    initTestimonials();
    initTabs();
    initLightbox();
    initGalleries();
    initVideos();
    initToc();
    initChapters();
    initRail();
    initStepsLine();
    initFilters();
  });
})();
