/* ============================================================
   cookie-consent.js — banner RODO/cookies, localStorage.
   Ładowany na index.html, wizytowka.html i polityka-prywatnosci.html.
   ============================================================ */
(function () {
  "use strict";

  var STORAGE_KEY = "grodmax-cookie-consent";

  function getChoice() {
    try { return window.localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function setChoice(value) {
    try { window.localStorage.setItem(STORAGE_KEY, value); } catch (e) { /* ignore */ }
  }

  function showBanner(banner) {
    banner.classList.add("is-visible");
  }

  function hideBanner(banner) {
    banner.classList.remove("is-visible");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var banner = document.getElementById("cookieBanner");
    if (!banner) return;

    var acceptBtn = document.getElementById("cookieAccept");
    var declineBtn = document.getElementById("cookieDecline");

    if (!getChoice()) {
      window.setTimeout(function () { showBanner(banner); }, 600);
    }

    if (acceptBtn) acceptBtn.addEventListener("click", function () { setChoice("accepted"); hideBanner(banner); });
    if (declineBtn) declineBtn.addEventListener("click", function () { setChoice("declined"); hideBanner(banner); });

    // Wywoływane z polityka-prywatnosci.html przyciskiem "Zmień ustawienia cookies".
    window.GRODMAX_resetCookieChoice = function () {
      setChoice("");
      try { window.localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
      showBanner(banner);
    };
  });
})();
