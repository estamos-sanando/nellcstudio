/* ==========================================================================
   UI — reveal, acordeones, navegación, comandos tipeados
   Sin dependencias. Expone window.Nell para terminal.js.
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var Nell = (window.Nell = window.Nell || {});
  Nell.reduce = reduce;

  /* ---------- Escritura progresiva ---------- */
  Nell.type = function (el, text, ms, done) {
    if (reduce) { el.textContent = text; if (done) done(); return; }
    var i = 0;
    el.textContent = "";
    (function step() {
      i++;
      el.textContent = text.slice(0, i);
      if (i < text.length) setTimeout(step, ms + Math.random() * ms * 0.6);
      else if (done) done();
    })();
  };

  /* ---------- Acordeones ---------- */
  function setOpen(node, open) {
    var btn = node.querySelector(".node__toggle");
    if (!btn) return;
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    node.classList.toggle("is-open", open);
  }

  Nell.openNode = function (id, scroll) {
    var node = document.getElementById(id);
    if (!node || !node.classList.contains("node")) return;
    var group = node.closest("[data-accordion]");
    if (group && group.hasAttribute("data-single")) {
      $$(".node.is-open", group).forEach(function (n) { if (n !== node) setOpen(n, false); });
    }
    setOpen(node, true);
    if (scroll) {
      setTimeout(function () {
        node.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      }, 60);
    }
  };

  function initAccordions() {
    $$("[data-accordion]").forEach(function (group) {
      var single = group.hasAttribute("data-single");
      var toggles = $$(".node__toggle", group);

      toggles.forEach(function (btn) {
        var node = btn.closest(".node");
        node.classList.toggle("is-open", btn.getAttribute("aria-expanded") === "true");

        btn.addEventListener("click", function () {
          var open = btn.getAttribute("aria-expanded") !== "true";
          if (open && single) {
            toggles.forEach(function (b) { if (b !== btn) setOpen(b.closest(".node"), false); });
          }
          setOpen(node, open);
        });

        // Flechas ↑ ↓ Home End entre los items del grupo
        btn.addEventListener("keydown", function (e) {
          var i = toggles.indexOf(btn), t = null;
          if (e.key === "ArrowDown") t = toggles[(i + 1) % toggles.length];
          else if (e.key === "ArrowUp") t = toggles[(i - 1 + toggles.length) % toggles.length];
          else if (e.key === "Home") t = toggles[0];
          else if (e.key === "End") t = toggles[toggles.length - 1];
          if (t) { e.preventDefault(); t.focus(); }
        });
      });
    });

    // enlaces internos que abren un nodo (p. ej. Disciplines → proyectos)
    $$("[data-open]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        Nell.openNode(a.getAttribute("data-open"), true);
      });
    });
  }

  /* ---------- Navegación entre secciones ---------- */
  var SECTIONS = ["projects", "disciplines", "about", "contact"];

  Nell.goTo = function (id) {
    var el = document.getElementById(id);
    if (!el) return false;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    try { history.replaceState(null, "", "#" + id); } catch (e) {}
    el.classList.add("is-flash");
    setTimeout(function () { el.classList.remove("is-flash"); }, 1100);
    return true;
  };

  function initNav() {
    var links = $$(".dirnav__list a");
    var pathEl = document.getElementById("navPath");

    function setCurrent(id) {
      links.forEach(function (a) {
        if (a.getAttribute("href") === "#" + id) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
      if (pathEl) pathEl.textContent = "~/nellcstudio" + (id ? "/" + id : "");
    }

    links.forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href").slice(1);
        e.preventDefault();
        Nell.goTo(id);
      });
    });

    if (!("IntersectionObserver" in window)) return;
    var visible = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { visible[en.target.id] = en.isIntersecting; });
      var current = "";
      SECTIONS.forEach(function (id) { if (visible[id]) current = id; });
      setCurrent(current);
    }, { rootMargin: "-35% 0px -60% 0px" });
    SECTIONS.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }

  /* ---------- Reveal on scroll + comandos tipeados ---------- */
  function initReveal() {
    var items = $$(".reveal");
    if (!("IntersectionObserver" in window) || reduce) {
      items.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-in");
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
  }

  function initTyped() {
    var cmds = $$("[data-type]");
    if (reduce || !("IntersectionObserver" in window)) return;
    cmds.forEach(function (el) { el.setAttribute("data-full", el.getAttribute("data-type")); el.textContent = ""; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        Nell.type(en.target, en.target.getAttribute("data-full"), 38);
      });
    }, { threshold: 1 });
    cmds.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Deep link (#project-03, #contact…) ---------- */
  function initHash() {
    var id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    if (document.getElementById(id) && document.getElementById(id).classList.contains("node")) {
      Nell.openNode(id, true);
    }
  }

  /* ---------- Init ---------- */
  root.classList.add("reveal-ready");
  initAccordions();
  initNav();
  initReveal();
  initTyped();
  initHash();

  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
