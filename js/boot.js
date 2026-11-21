/* ==========================================================================
   BOOT — secuencia de inicio de nellcstudio.exe
   Modos (decididos en el <head> y guardados en <html data-boot>):
     full → primera visita              (~4.5 s)
     fast → visita posterior            (~1.8 s)
     off  → misma sesión / reduced-motion / enlace con #hash (no se muestra)
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var mode = root.getAttribute("data-boot");
  var boot = document.getElementById("boot");

  function announceReady() {
    root.classList.add("site-ready");
    document.dispatchEvent(new CustomEvent("nell:ready"));
  }

  if ((mode !== "full" && mode !== "fast") || !boot) {
    root.classList.remove("boot-active");
    announceReady();
    return;
  }

  var win = document.getElementById("bootWindow");
  var log = document.getElementById("bootLog");
  var phaseEl = document.getElementById("bootPhase");
  var skipBtn = document.getElementById("bootSkip");

  var dead = false; // true cuando se omite o finaliza
  var finished = false;
  var caret = document.createElement("span");
  caret.className = "caret";
  caret.setAttribute("aria-hidden", "true");

  try { sessionStorage.setItem("nell:session", "1"); } catch (e) {}

  /* ---------- utilidades ---------- */
  function sleep(ms) {
    return new Promise(function (r) { setTimeout(r, ms); });
  }

  function addLine(cls) {
    var el = document.createElement("div");
    el.className = "boot__line" + (cls ? " " + cls : "");
    log.appendChild(el);
    return el;
  }

  /* Escribe `text` en `node` en función del tiempo (no de los frames) */
  function type(node, text, msPerChar) {
    return new Promise(function (resolve) {
      var t0 = performance.now();
      var n = text.length;
      var shown = 0;
      function frame(t) {
        if (dead) return resolve();
        var k = Math.min(n, Math.floor((t - t0) / msPerChar) + 1);
        if (k !== shown) { node.nodeValue = text.slice(0, k); shown = k; }
        if (k >= n) resolve();
        else requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
  }

  function setPhase(num, label) {
    phaseEl.innerHTML = "";
    phaseEl.appendChild(document.createTextNode("PHASE "));
    var b = document.createElement("b");
    b.textContent = num;
    phaseEl.appendChild(b);
    phaseEl.appendChild(document.createTextNode(" — " + label));
  }

  /* Línea con partes: [{t:'USER: ', c:'k'}, {t:'ANTONELLA', c:'v'}] */
  async function say(parts, opts) {
    if (dead) return;
    opts = opts || {};
    var line = addLine(opts.cls);
    var speed = opts.speed || 5;
    if (typeof parts === "string") parts = [{ t: parts }];
    for (var i = 0; i < parts.length; i++) {
      var span = document.createElement("span");
      if (parts[i].c) span.className = parts[i].c;
      var tn = document.createTextNode("");
      span.appendChild(tn);
      line.appendChild(span);
      line.appendChild(caret);
      await type(tn, parts[i].t, parts[i].speed || speed);
      if (dead) return;
    }
    if (opts.ok) {
      var ok = document.createElement("span");
      ok.className = "ok";
      ok.textContent = "[ OK ]";
      line.appendChild(ok);
    }
    await sleep(opts.after == null ? 40 : opts.after);
  }

  async function gap(ms) {
    if (dead) return;
    addLine("boot__line--gap");
    await sleep(ms == null ? 50 : ms);
  }

  function progress(duration) {
    return new Promise(function (resolve) {
      if (dead) return resolve();
      var wrap = document.createElement("div");
      wrap.className = "boot__progress";
      wrap.innerHTML =
        '<div class="boot__bar"><div class="boot__fill"></div></div><span class="boot__pct">0%</span>';
      log.appendChild(wrap);
      caret.remove();
      var fill = wrap.querySelector(".boot__fill");
      var pct = wrap.querySelector(".boot__pct");
      var t0 = performance.now();
      var last = -1;
      function frame(t) {
        if (dead) return resolve();
        var p = Math.min(1, (t - t0) / duration);
        // easing: arranca rápido, frena al final (sensación de “carga real”)
        var e = 1 - Math.pow(1 - p, 2.2);
        fill.style.transform = "scaleX(" + e.toFixed(4) + ")";
        var v = Math.round(e * 100);
        if (v !== last) { pct.textContent = v + "%"; last = v; }
        if (p < 1) requestAnimationFrame(frame);
        else resolve();
      }
      requestAnimationFrame(frame);
    });
  }

  /* ---------- guion ---------- */
  async function scriptFull() {
    setPhase("01/03", "SYSTEM INITIALIZATION");
    await say([{ t: "NELLCSTUDIO" }, { t: "®", c: "reg" }], { cls: "boot__line--brand", speed: 26, after: 60 });
    await say("CREATIVE SYSTEM v1.0", { cls: "boot__line--version", speed: 9, after: 30 });
    await gap(40);
    await say("Initializing creative environment...", { ok: true });
    await say("Loading visual identity...", { ok: true });
    await say("Loading narrative modules...", { ok: true });
    await say("Loading interactive experiences...", { ok: true, after: 90 });

    await gap(30);
    setPhase("02/03", "USER IDENTIFICATION");
    await say([{ t: "USER: ", c: "k" }, { t: "ANTONELLA COSTA", c: "v" }]);
    await say([{ t: "ROLE: ", c: "k" }, { t: "CREATIVE DIRECTOR", c: "v" }]);
    await say([{ t: "LOCATION: ", c: "k" }, { t: "BUENOS AIRES, ARGENTINA", c: "v" }], { after: 40 });
    await gap(30);
    await say([{ t: "SPECIALIZATION:", c: "k" }]);
    await say([{ t: "> ", c: "arrow" }, { t: "DIGITAL LUDONARRATIVES", c: "v" }]);
    await say([{ t: "> ", c: "arrow" }, { t: "CONTENT PRODUCTION", c: "v" }], { after: 90 });

    await gap(30);
    setPhase("03/03", "EXECUTION");
    await say("All systems ready.", { cls: "boot__line--ready", after: 50 });
    await gap(30);
    await say([{ t: "Executing " }, { t: "nellcstudio.exe", c: "v" }, { t: "..." }], { cls: "boot__line--exec", speed: 12, after: 60 });
    await progress(800);
    await sleep(100);
  }

  async function scriptFast() {
    setPhase("01/01", "SESSION RESTORED");
    await say([{ t: "NELLCSTUDIO" }, { t: "®", c: "reg" }], { cls: "boot__line--brand", speed: 14, after: 30 });
    await say("CREATIVE SYSTEM v1.0", { cls: "boot__line--version", speed: 6, after: 20 });
    await gap(30);
    await say("Cached environment found. Welcome back.", { speed: 4, after: 40 });
    await say([{ t: "Executing " }, { t: "nellcstudio.exe", c: "v" }, { t: "..." }], { cls: "boot__line--exec", speed: 6, after: 40 });
    await progress(500);
    await sleep(80);
  }

  /* ---------- cierre ---------- */
  function markSeen() {
    try { localStorage.setItem("nell:boot", "1"); } catch (e) {}
  }

  function teardown() {
    var hadFocus = boot.contains(document.activeElement);
    root.classList.remove("boot-active");
    boot.remove();
    var h1 = document.getElementById("hero-title");
    if (hadFocus && h1) h1.focus({ preventScroll: true });
    announceReady();
  }

  async function finish(skipped) {
    if (finished) return;
    finished = true;
    dead = true;
    markSeen();
    document.removeEventListener("keydown", onKey);
    document.removeEventListener("focusin", onFocusIn);

    if (skipped) {
      boot.classList.add("is-leaving-fast");
      await sleep(210);
      return teardown();
    }

    // 1) glitch muy breve
    boot.classList.add("is-glitch");
    await sleep(230);
    boot.classList.remove("is-glitch");

    // 2) la ventana se expande hasta ocupar toda la pantalla
    var r = win.getBoundingClientRect();
    var s = Math.max(window.innerWidth / r.width, window.innerHeight / r.height) * 1.04;
    win.style.setProperty("--s", s.toFixed(3));
    boot.classList.add("is-expanding");
    root.classList.add("site-ready"); // el hero empieza a aparecer debajo
    await sleep(520);

    // 3) fundido final y entrega
    boot.classList.add("is-leaving");
    await sleep(280);
    teardown();
  }

  function onKey(e) {
    if (e.key === "Escape") finish(true);
  }
  function onFocusIn(e) {
    // si el foco sale del overlay, el usuario quiere navegar: no bloqueamos nada
    if (!boot.contains(e.target)) finish(true);
  }

  skipBtn.addEventListener("click", function () { finish(true); });
  document.addEventListener("keydown", onKey);
  document.addEventListener("focusin", onFocusIn);
  skipBtn.focus({ preventScroll: true });

  (mode === "fast" ? scriptFast() : scriptFull()).then(function () {
    if (!dead) finish(false);
  });
})();
