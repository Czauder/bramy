/* ============================================================
   gallery.js — galeria realizacji (siatka zdjęć + "pokaż więcej") + lightbox.
   Tylko index.html.
   ============================================================ */
(function () {
  "use strict";

  var grid = document.getElementById("galleryGrid");
  if (!grid) return;

  var tiles = Array.prototype.slice.call(grid.querySelectorAll(".gallery-tile"));

  /* ---------- Pokaż więcej ---------- */
  var moreBtn = document.getElementById("galleryMoreBtn");
  if (moreBtn) {
    moreBtn.addEventListener("click", function () {
      tiles.forEach(function (tile) {
        if (tile.classList.contains("is-more")) tile.classList.remove("is-hidden");
      });
      moreBtn.parentElement.remove();
    });
  }

  /* ---------- Lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxImage = document.getElementById("lightboxImage");
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
    var img = tile.querySelector("img");
    lightboxImage.src = img.src;
    lightboxImage.alt = img.alt;
    lightboxTitle.textContent = (currentIndex + 1) + " / " + list.length;
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

  tiles.forEach(function (tile) {
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
