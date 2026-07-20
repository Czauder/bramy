/* ============================================================
   page-loader.js — chowa ekran startowy (logo) po załadowaniu strony.
   Widoczny domyślnie w HTML/CSS (bez JS) — ten skrypt tylko go chowa,
   więc przy wyłączonym JS strona po prostu nigdy go nie ukryje (dlatego
   w HTML jest też <noscript>, który chowa go od razu w takim wypadku).
   ============================================================ */
(function () {
  "use strict";

  var loader = document.getElementById("pageLoader");
  if (!loader) return;

  var MIN_VISIBLE_MS = 900;
  var SAFETY_TIMEOUT_MS = 4000;
  var start = Date.now();
  var hidden = false;

  document.body.style.overflow = "hidden";

  function hide() {
    if (hidden) return;
    hidden = true;
    loader.classList.add("is-hidden");
    document.body.style.overflow = "";
    window.setTimeout(function () {
      if (loader.parentNode) loader.parentNode.removeChild(loader);
    }, 600);
  }

  function hideAfterMinimum() {
    var remaining = Math.max(0, MIN_VISIBLE_MS - (Date.now() - start));
    window.setTimeout(hide, remaining);
  }

  if (document.readyState === "complete") {
    hideAfterMinimum();
  } else {
    window.addEventListener("load", hideAfterMinimum);
  }

  // Zabezpieczenie: nawet gdyby zdarzenie "load" się nie odpaliło, loader
  // i tak zniknie po 4 sekundach, żeby nigdy nie zablokować strony.
  window.setTimeout(hide, SAFETY_TIMEOUT_MS);
})();
