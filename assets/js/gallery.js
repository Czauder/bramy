/* ============================================================
   gallery.js — filtrowanie Realizacji + lightbox. Tylko index.html.
   ============================================================ */
(function () {
  "use strict";

  var grid = document.getElementById("galleryGrid");
  if (!grid) return;

  var filterButtons = document.querySelectorAll(".filter-btn");
  var tiles = Array.prototype.slice.call(grid.querySelectorAll(".gallery-tile"));

  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterButtons.forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      var filter = btn.getAttribute("data-filter");
      tiles.forEach(function (tile) {
        var show = filter === "all" || tile.getAttribute("data-category") === filter;
        tile.classList.toggle("is-hidden", !show);
      });
    });
  });

  /* ---------- Lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxIcon = document.getElementById("lightboxIcon");
  var lightboxTitle = document.getElementById("lightboxTitle");
  var closeBtn = document.getElementById("lightboxClose");
  var prevBtn = document.getElementById("lightboxPrev");
  var nextBtn = document.getElementById("lightboxNext");
  var currentIndex = 0;
  var lastFocused = null;

  function visibleTiles() {
    return tiles.filter(function (t) { return !t.classList.contains("is-hidden"); });
  }

  function openLightbox(index) {
    var list = visibleTiles();
    if (!list.length) return;
    currentIndex = (index + list.length) % list.length;
    var tile = list[currentIndex];
    var iconUse = tile.querySelector("svg use");
    lightboxIcon.querySelector("use").setAttribute("href", iconUse.getAttribute("href"));
    lightboxTitle.textContent = tile.getAttribute("data-title") || "";
    lastFocused = document.activeElement;
    lightbox.classList.add("is-open");
    closeBtn.focus();
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  function step(dir) {
    var list = visibleTiles();
    if (!list.length) return;
    openLightbox(currentIndex + dir);
  }

  tiles.forEach(function (tile, i) {
    tile.addEventListener("click", function () { openLightbox(visibleTiles().indexOf(tile)); });
  });

  closeBtn.addEventListener("click", closeLightbox);
  prevBtn.addEventListener("click", function () { step(-1); });
  nextBtn.addEventListener("click", function () { step(1); });
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", function (e) {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });
})();
