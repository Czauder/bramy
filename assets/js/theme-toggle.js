/* ============================================================
   theme-toggle.js — przełącznik jasny/ciemny (domyślnie ciemny).
   Zapobieganie miganiu (FOUC) obsługuje osobny inline-skrypt w <head>
   każdej strony, który ustawia data-theme jeszcze przed pierwszym
   renderem. Ten plik obsługuje już samo kliknięcie + zapis wyboru.
   ============================================================ */
(function () {
  "use strict";

  var STORAGE_KEY = "grodmax-theme";

  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  function apply(theme) {
    if (theme === "light") document.documentElement.setAttribute("data-theme", "light");
    else document.documentElement.removeAttribute("data-theme");
    document.querySelectorAll(".theme-toggle").forEach(function (btn) {
      btn.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    apply(currentTheme());
    document.querySelectorAll(".theme-toggle").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var next = currentTheme() === "light" ? "dark" : "light";
        try { window.localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* ignore */ }
        apply(next);
      });
    });
  });
})();
