/* ==========================================================================
   TERMINAL — prompt interactivo del hero
   Usa textContent / createElement (nunca innerHTML con texto del usuario).
   ========================================================================== */
(function () {
  "use strict";

  var form = document.getElementById("promptForm");
  if (!form) return;

  var input = document.getElementById("promptInput");
  var out = document.getElementById("promptOut");
  var Nell = window.Nell || {};

  var cmdHistory = [];
  var hIndex = 0;
  var touched = false; // el usuario ya interactuó con el input
  var MAX_LINES = 40;

  var DIRS = [
    { n: "01", id: "projects", label: "PROJECTS", d: "4 files" },
    { n: "02", id: "disciplines", label: "DISCIPLINES", d: "2 modules" },
    { n: "03", id: "about", label: "ABOUT", d: "whoami" },
    { n: "04", id: "contact", label: "CONTACT", d: "transmit.exe" }
  ];

  /* ---------- helpers de salida ---------- */
  function trim() {
    while (out.children.length > MAX_LINES) out.removeChild(out.firstChild);
  }
  function echo(cmd) {
    var d = document.createElement("div");
    d.className = "echo";
    var b = document.createElement("b");
    b.textContent = "antonella@nellcstudio:~$ ";
    d.appendChild(b);
    d.appendChild(document.createTextNode(cmd));
    out.appendChild(d);
  }
  function res(text, err) {
    var d = document.createElement("div");
    d.className = "res" + (err ? " err" : "");
    d.textContent = text;
    out.appendChild(d);
  }
  function dirLink(dir) {
    var a = document.createElement("a");
    a.className = "dir";
    a.href = "#" + dir.id;
    a.innerHTML = '<span class="n"></span><span class="l"></span><span class="d"></span>';
    a.children[0].textContent = dir.n + " /";
    a.children[1].textContent = dir.label;
    a.children[2].textContent = dir.d;
    a.addEventListener("click", function (e) { e.preventDefault(); if (Nell.goTo) Nell.goTo(dir.id); });
    out.appendChild(a);
  }
  function extLink(href, label) {
    var a = document.createElement("a");
    a.className = "res ext";
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = label;
    out.appendChild(a);
  }

  /* ---------- comandos ---------- */
  function findDir(arg) {
    arg = (arg || "").toLowerCase().replace(/^~?\/?(nellcstudio\/)?/, "").replace(/\/$/, "");
    for (var i = 0; i < DIRS.length; i++) {
      var d = DIRS[i];
      if (arg === d.id || arg === d.n || arg === String(i + 1) || arg === d.label.toLowerCase()) return d;
    }
    return null;
  }

  function listDirs() {
    DIRS.forEach(dirLink);
    res("tip: cd <dir> · open <1-4> · help");
  }

  var COMMANDS = {
    help: function () {
      res(
        [
          "explore        listar directorios",
          "cd <dir>       ir a projects | disciplines | about | contact",
          "open <1-4>     abrir un proyecto",
          "whoami         quién está detrás",
          "instagram      abrir @nellcstudio",
          "clear          limpiar la terminal",
          "replay         volver a ver la intro"
        ].join("\n")
      );
    },
    explore: listDirs,
    ls: listDirs,
    dir: listDirs,
    whoami: function () {
      res("antonella costa — fundadora y directora creativa de nellcstudio®\nbuenos aires, argentina");
    },
    instagram: function () {
      extLink("https://www.instagram.com/nellcstudio/", "instagram.com/nellcstudio -> @nellcstudio");
    },
    clear: function () { out.textContent = ""; },
    cls: function () { out.textContent = ""; },
    replay: function () {
      res("rebooting nellcstudio.exe...");
      try {
        sessionStorage.removeItem("nell:session");
        history.replaceState(null, "", location.pathname + "?intro=replay");
      } catch (e) {}
      setTimeout(function () { location.reload(); }, 450);
    },
    cd: function (arg) {
      if (!arg) return res("uso: cd <projects|disciplines|about|contact>", true);
      var d = findDir(arg);
      if (!d) return res("cd: no such directory: " + arg.slice(0, 40), true);
      res("navegando a ~/nellcstudio/" + d.id + " ...");
      if (Nell.goTo) Nell.goTo(d.id);
    },
    open: function (arg) {
      var n = parseInt(arg, 10);
      if (!(n >= 1 && n <= 4)) return res("uso: open <1-4>", true);
      res("abriendo project-0" + n + " ...");
      if (Nell.goTo) Nell.goTo("projects");
      if (Nell.openNode) Nell.openNode("project-0" + n, true);
    }
  };

  function run(raw) {
    var line = raw.trim();
    if (!line) return;
    cmdHistory.push(line);
    hIndex = cmdHistory.length;
    echo(line);

    var parts = line.split(/\s+/);
    var cmd = parts[0].toLowerCase();
    var arg = parts.slice(1).join(" ");

    if (Object.prototype.hasOwnProperty.call(COMMANDS, cmd)) {
      COMMANDS[cmd](arg);
    } else if (findDir(cmd)) {
      COMMANDS.cd(cmd);
    } else {
      res("command not found: " + cmd.slice(0, 30) + " — escribí help", true);
    }
    trim();
  }

  /* ---------- eventos ---------- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    touched = true;
    run(input.value);
    input.value = "";
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "ArrowUp" && cmdHistory.length) {
      e.preventDefault();
      hIndex = Math.max(0, hIndex - 1);
      input.value = cmdHistory[hIndex] || "";
    } else if (e.key === "ArrowDown" && cmdHistory.length) {
      e.preventDefault();
      hIndex = Math.min(cmdHistory.length, hIndex + 1);
      input.value = cmdHistory[hIndex] || "";
    }
  });
  input.addEventListener("input", function () { touched = true; });
  input.addEventListener("focus", function () { touched = true; });

  /* ---------- auto-tipeo inicial de “explore” (no roba el foco) ---------- */
  function autoType() {
    var word = "explore";
    if (touched) return;
    if (Nell.reduce) { input.value = word; return; }
    input.value = "";
    var i = 0;
    (function step() {
      if (touched) { if (!input.value) input.value = word; return; }
      i++;
      input.value = word.slice(0, i);
      if (i < word.length) setTimeout(step, 85 + Math.random() * 60);
    })();
  }

  function start() { setTimeout(autoType, 900); }
  if (document.documentElement.classList.contains("site-ready")) start();
  else document.addEventListener("nell:ready", start, { once: true });
})();
