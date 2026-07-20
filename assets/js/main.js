/* ============================================================
   main.js — navbar, menu mobilne, scroll-reveal, parallax hero,
   liczniki USP, tilt na kartach. Tylko index.html.
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Navbar shrink/blur ---------- */
  var navbar = document.getElementById("navbar");
  function onScrollNavbar() {
    if (!navbar) return;
    navbar.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  document.addEventListener("scroll", onScrollNavbar, { passive: true });
  onScrollNavbar();

  /* ---------- Mobile menu ---------- */
  var menuToggle = document.getElementById("menuToggle");
  var mobileMenu = document.getElementById("mobileMenu");
  if (menuToggle && mobileMenu) {
    function closeMobileMenu() {
      mobileMenu.classList.remove("is-open");
      menuToggle.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      document.body.classList.remove("menu-open");
    }
    function openMobileMenu() {
      mobileMenu.classList.add("is-open");
      menuToggle.classList.add("is-open");
      menuToggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      document.body.classList.add("menu-open");
    }
    menuToggle.addEventListener("click", function () {
      if (mobileMenu.classList.contains("is-open")) closeMobileMenu();
      else openMobileMenu();
    });
    mobileMenu.querySelectorAll(".mobile-menu-links a").forEach(function (link) {
      link.addEventListener("click", closeMobileMenu);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mobileMenu.classList.contains("is-open")) closeMobileMenu();
    });
  }

  /* ---------- Back to top ---------- */
  var backToTop = document.getElementById("backToTop");
  if (backToTop) {
    document.addEventListener("scroll", function () {
      backToTop.classList.toggle("is-visible", window.scrollY > 600);
    }, { passive: true });
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealTargets = document.querySelectorAll("[data-reveal], [data-reveal-stagger]");
  if (reduceMotion) {
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  } else if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Hero parallax (subtle, transform only) ---------- */
  var hero = document.querySelector(".hero");
  if (hero && !reduceMotion) {
    document.addEventListener("scroll", function () {
      var offset = Math.min(window.scrollY, 700);
      hero.style.backgroundPositionY = (50 + offset * 0.02) + "%";
    }, { passive: true });
  }

  /* ---------- USP animated counters ---------- */
  var counters = document.querySelectorAll(".usp-number[data-count]");
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) {
      el.textContent = target.toFixed(decimals) + suffix;
      return;
    }
    var duration = 1600;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = target * eased;
      el.textContent = value.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (counters.length && "IntersectionObserver" in window) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { counterObserver.observe(el); });
  } else {
    counters.forEach(animateCounter);
  }

  /* ---------- Card tilt (offer + gallery) ---------- */
  if (!reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll(".offer-card, .gallery-tile").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = "perspective(700px) rotateX(" + (y * -6) + "deg) rotateY(" + (x * 8) + "deg) translateY(-4px)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }

  /* ---------- Opinie: carousel prev/next ---------- */
  var track = document.getElementById("testimonialTrack");
  var prevBtn = document.getElementById("testimonialPrev");
  var nextBtn = document.getElementById("testimonialNext");
  if (track && prevBtn && nextBtn) {
    function scrollByCard(dir) {
      var card = track.querySelector(".testimonial-card");
      var step = card ? card.getBoundingClientRect().width + 20 : 340;
      track.scrollBy({ left: dir * step, behavior: reduceMotion ? "auto" : "smooth" });
    }
    prevBtn.addEventListener("click", function () { scrollByCard(-1); });
    nextBtn.addEventListener("click", function () { scrollByCard(1); });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
