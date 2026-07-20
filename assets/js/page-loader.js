/* ============================================================
   page-loader.js — chowa ekran startowy (logo) po załadowaniu strony.
   Widoczny domyślnie w HTML/CSS (bez JS) — ten skrypt tylko go chowa,
   więc przy wyłączonym JS strona po prostu nigdy go nie ukryje (dlatego
   w HTML jest też <noscript>, który chowa go od razu w takim wypadku).

   Pokazuje pełną animację tylko przy PIERWSZEJ wizycie w danej sesji
   przeglądarki (sessionStorage) — przy kolejnych przejściach między
   podstronami znika natychmiast, żeby nie spowalniać nawigacji.
   ============================================================ */
(function () {
  "use strict";

  var loader = document.getElementById("pageLoader");
  if (!loader) return;

  var SESSION_KEY = "n-system-loaded";
  var MIN_VISIBLE_MS = 900;
  var SAFETY_TIMEOUT_MS = 4000;
  var hidden = false;

  var seenBefore = false;
  try { seenBefore = sessionStorage.getItem(SESSION_KEY) === "1"; } catch (e) { /* ignore */ }
  try { sessionStorage.setItem(SESSION_KEY, "1"); } catch (e) { /* ignore */ }

  function remove() {
    if (loader.parentNode) loader.parentNode.removeChild(loader);
  }

  function hide(instant) {
    if (hidden) return;
    hidden = true;
    if (instant) loader.style.transition = "none";
    loader.classList.add("is-hidden");
    document.body.style.overflow = "";
    if (instant) remove();
    else window.setTimeout(remove, 600);
  }

  if (seenBefore) {
    hide(true);
    return;
  }

  var start = Date.now();
  document.body.style.overflow = "hidden";

  function hideAfterMinimum() {
    var remaining = Math.max(0, MIN_VISIBLE_MS - (Date.now() - start));
    window.setTimeout(function () { hide(false); }, remaining);
  }

  if (document.readyState === "complete") {
    hideAfterMinimum();
  } else {
    window.addEventListener("load", hideAfterMinimum);
  }

  // Zabezpieczenie: nawet gdyby zdarzenie "load" się nie odpaliło, loader
  // i tak zniknie po 4 sekundach, żeby nigdy nie zablokować strony.
  window.setTimeout(function () { hide(false); }, SAFETY_TIMEOUT_MS);
})();
