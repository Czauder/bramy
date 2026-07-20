/* ============================================================
   forms.js — walidacja formularza kontaktowego + wysyłka do Formspree.
   Tylko index.html.
   ============================================================ */
(function () {
  "use strict";

  var form = document.getElementById("contactForm");
  if (!form) return;

  var statusEl = document.getElementById("formStatus");
  var submitBtn = form.querySelector("button[type='submit']");
  var placeholderId = "YOUR_FORM_ID";

  function t(key, fallback) {
    return (window.GRODMAX_I18N && window.GRODMAX_I18N.t(key)) || fallback;
  }

  function showStatus(kind, message) {
    statusEl.textContent = message;
    statusEl.className = "form-status is-visible " + (kind === "success" ? "is-success" : "is-error");
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var name = form.name.value.trim();
    var phone = form.phone.value.trim();
    var email = form.email.value.trim();

    if (!name || !phone || !email || !isValidEmail(email) || !form.consent.checked) {
      showStatus("error", t("contact.form.error", "Uzupełnij poprawnie wymagane pola formularza."));
      return;
    }

    // Honeypot — jeśli wypełnione, prawdopodobnie bot: udajemy sukces, nic nie wysyłamy.
    if (form._gotcha.value) {
      showStatus("success", t("contact.form.success", "Dziękujemy! Wiadomość została wysłana."));
      form.reset();
      return;
    }

    var actionUrl = form.getAttribute("action") || "";
    if (actionUrl.indexOf(placeholderId) !== -1) {
      console.warn("[GRODMAX] Formspree form ID nie został jeszcze skonfigurowany — podmień YOUR_FORM_ID w index.html na prawdziwe ID z konta Formspree.");
      showStatus("error", t("contact.form.error", "Formularz nie jest jeszcze podłączony — skontaktuj się z nami telefonicznie."));
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = t("contact.form.sending", "Wysyłanie...");

    fetch(actionUrl, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    })
      .then(function (response) {
        if (response.ok) {
          showStatus("success", t("contact.form.success", "Dziękujemy! Wiadomość została wysłana, odezwiemy się wkrótce."));
          form.reset();
        } else {
          showStatus("error", t("contact.form.error", "Coś poszło nie tak. Spróbuj ponownie lub zadzwoń do nas bezpośrednio."));
        }
      })
      .catch(function () {
        showStatus("error", t("contact.form.error", "Coś poszło nie tak. Spróbuj ponownie lub zadzwoń do nas bezpośrednio."));
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = t("contact.form.submit", "Wyślij zapytanie");
      });
  });
})();
