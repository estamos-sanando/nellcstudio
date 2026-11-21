/* ==========================================================================
   CONTACT — validación y envío del formulario
   · Si <form data-endpoint> está vacío NO se envía nada y se avisa con honestidad.
   · Si tiene endpoint (Formspree, Web3Forms, backend propio…) hace POST (JSON).
   · Nunca muestra “enviado” si el servidor no respondió OK.
   ========================================================================== */
(function () {
  "use strict";

  var form = document.getElementById("contactForm");
  if (!form) return;

  var statusEl = document.getElementById("formStatus");
  var btn = document.getElementById("formSubmit");
  var LABEL = btn.textContent;
  var INSTAGRAM = "https://www.instagram.com/nellcstudio/";

  var fields = {
    nombre: { el: form.elements["nombre"], err: document.getElementById("e-name") },
    email: { el: form.elements["email"], err: document.getElementById("e-email") },
    mensaje: { el: form.elements["mensaje"], err: document.getElementById("e-msg") }
  };

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function check(name) {
    var f = fields[name];
    var v = f.el.value.trim();
    var msg = "";
    if (name === "nombre" && v.length < 2) msg = "ingresá tu nombre";
    if (name === "email") {
      if (!v) msg = "ingresá tu email";
      else if (!EMAIL_RE.test(v)) msg = "el email no parece válido";
    }
    if (name === "mensaje" && v.length < 10) msg = "contanos un poco más (mín. 10 caracteres)";
    f.err.textContent = msg;
    if (msg) f.el.setAttribute("aria-invalid", "true");
    else f.el.removeAttribute("aria-invalid");
    return !msg;
  }

  Object.keys(fields).forEach(function (name) {
    fields[name].el.addEventListener("blur", function () { check(name); });
    fields[name].el.addEventListener("input", function () {
      if (fields[name].el.getAttribute("aria-invalid")) check(name);
    });
  });

  function show(kind, html) {
    statusEl.className = "form__status mono " + (kind ? "is-" + kind : "");
    statusEl.innerHTML = html;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // honeypot: si se completa es un bot → no hacemos nada
    if (form.elements["website"] && form.elements["website"].value) return;

    var firstBad = null;
    Object.keys(fields).forEach(function (name) {
      if (!check(name) && !firstBad) firstBad = fields[name].el;
    });
    if (firstBad) {
      show("error", "<b>ERR</b> revisá los campos marcados.");
      firstBad.focus();
      return;
    }

    var endpoint = (form.getAttribute("data-endpoint") || "").trim();

    if (!endpoint) {
      // Sin servicio conectado: NO simulamos el envío.
      show(
        "error",
        "<b>ERR 503</b> · el servicio de recepción todavía no está conectado. " +
          "Tu mensaje <b>no fue enviado</b>. Mientras tanto, escribinos por " +
          '<a href="' + INSTAGRAM + '" target="_blank" rel="noopener noreferrer">Instagram @nellcstudio</a>.'
      );
      return;
    }

    var data = {};
    new FormData(form).forEach(function (v, k) { if (k !== "website") data[k] = String(v); });

    var ctrl = "AbortController" in window ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 12000);

    btn.disabled = true;
    btn.textContent = "[ TRANSMITTING... ]";
    show("", "transmitting...");

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data),
      signal: ctrl ? ctrl.signal : undefined
    })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        show("ok", "<b>OK</b> · mensaje transmitido. Gracias, te respondemos pronto.");
        form.reset();
      })
      .catch(function () {
        show(
          "error",
          "<b>ERR</b> · no pudimos transmitir el mensaje. Probá de nuevo o escribinos por " +
            '<a href="' + INSTAGRAM + '" target="_blank" rel="noopener noreferrer">Instagram</a>.'
        );
      })
      .then(function () {
        clearTimeout(timer);
        btn.disabled = false;
        btn.textContent = LABEL;
      });
  });
})();
