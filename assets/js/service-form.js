/* ============================================================
   service-form.js — formularz zgłoszenia serwisowego (serwis.html):
   przełącznik osoba/firma, checkbox "taka sama osoba kontaktowa",
   pole "inne urządzenie", podgląd załączonych zdjęć, walidacja,
   stany loading/success/error. Tylko serwis.html.
   ============================================================ */
(function () {
  "use strict";

  var form = document.getElementById("serviceForm");
  if (!form) return;

  function t(key, fallback) {
    return (window.GRODMAX_I18N && window.GRODMAX_I18N.t(key)) || fallback;
  }

  /* ---------- Warunkowe pola: firma ---------- */
  var companyFields = document.getElementById("companyFields");
  form.querySelectorAll('input[name="reporterType"]').forEach(function (radio) {
    radio.addEventListener("change", function () {
      companyFields.hidden = !(form.reporterType.value === "Firma");
    });
  });

  /* ---------- Warunkowe pole: osoba kontaktowa ---------- */
  var contactSame = document.getElementById("contactSame");
  var contactPersonField = document.getElementById("contactPersonField");
  contactSame.addEventListener("change", function () {
    contactPersonField.hidden = contactSame.checked;
  });

  /* ---------- Warunkowe pole: inne urządzenie ---------- */
  var deviceType = document.getElementById("deviceType");
  var deviceOtherField = document.getElementById("deviceOtherField");
  if (deviceType) {
    deviceType.addEventListener("change", function () {
      deviceOtherField.hidden = deviceType.value !== "Inne";
    });
  }

  /* ---------- Załączniki: dropzone + podgląd + usuwanie ---------- */
  var fileDrop = document.getElementById("fileDrop");
  var fileInput = document.getElementById("attachments");
  var previewList = document.getElementById("filePreviewList");
  var currentFiles = [];

  function renderPreviews() {
    previewList.innerHTML = "";
    currentFiles.forEach(function (file, index) {
      var item = document.createElement("div");
      item.className = "file-preview-item";

      if (file.type && file.type.indexOf("image/") === 0) {
        var img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        img.alt = file.name;
        item.appendChild(img);
      } else {
        var span = document.createElement("span");
        span.textContent = file.name;
        item.appendChild(span);
      }

      var removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "file-preview-remove";
      removeBtn.setAttribute("aria-label", "Usuń " + file.name);
      removeBtn.innerHTML = '<svg><use href="#icon-close"/></svg>';
      removeBtn.addEventListener("click", function () {
        currentFiles.splice(index, 1);
        syncFileInput();
        renderPreviews();
      });
      item.appendChild(removeBtn);

      previewList.appendChild(item);
    });
  }

  function syncFileInput() {
    if (typeof DataTransfer === "undefined") return;
    var dt = new DataTransfer();
    currentFiles.forEach(function (file) { dt.items.add(file); });
    fileInput.files = dt.files;
  }

  function addFiles(fileList) {
    Array.prototype.forEach.call(fileList, function (file) {
      if (file.type && file.type.indexOf("image/") === 0) currentFiles.push(file);
    });
    syncFileInput();
    renderPreviews();
  }

  if (fileInput) {
    fileInput.addEventListener("change", function () {
      addFiles(fileInput.files);
    });
  }
  if (fileDrop) {
    ["dragenter", "dragover"].forEach(function (evt) {
      fileDrop.addEventListener(evt, function (e) {
        e.preventDefault();
        fileDrop.classList.add("is-dragover");
      });
    });
    ["dragleave", "drop"].forEach(function (evt) {
      fileDrop.addEventListener(evt, function (e) {
        e.preventDefault();
        fileDrop.classList.remove("is-dragover");
      });
    });
    fileDrop.addEventListener("drop", function (e) {
      if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files);
    });
  }

  /* ---------- Walidacja ---------- */
  function showError(field, show) {
    var wrapper = field.closest(".field") || field.parentElement;
    var errorEl = document.getElementById(field.id + "Error");
    if (wrapper) wrapper.classList.toggle("has-error", show);
    if (errorEl) errorEl.classList.toggle("is-visible", show);
  }

  function isValidEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }
  function isValidPhone(value) { return /^[0-9+()\s-]{7,}$/.test(value); }

  function validate() {
    var valid = true;
    var firstInvalid = null;

    function check(field, condition) {
      var ok = condition;
      showError(field, !ok);
      if (!ok) { valid = false; if (!firstInvalid) firstInvalid = field; }
    }

    check(form.reporterName, form.reporterName.value.trim().length > 0);
    check(form.phone, isValidPhone(form.phone.value.trim()));
    check(form.email, isValidEmail(form.email.value.trim()));
    check(form.faultStreet, form.faultStreet.value.trim().length > 0);
    check(form.faultPostal, form.faultPostal.value.trim().length > 0);
    check(form.faultCity, form.faultCity.value.trim().length > 0);
    check(form.description, form.description.value.trim().length > 0);

    var consentEl = document.getElementById("svcConsent");
    var consentError = document.getElementById("svcConsentError");
    var consentOk = consentEl.checked;
    if (consentError) consentError.classList.toggle("is-visible", !consentOk);
    if (!consentOk) { valid = false; if (!firstInvalid) firstInvalid = consentEl; }

    if (firstInvalid) firstInvalid.focus();
    return valid;
  }

  /* ---------- Wysyłka ---------- */
  var statusEl = document.getElementById("serviceFormStatus");
  var submitBtn = document.getElementById("serviceSubmit");
  var successPanel = document.getElementById("formSuccess");
  var placeholderId = "YOUR_SERVICE_FORM_ID";

  function showStatus(kind, message) {
    statusEl.textContent = message;
    statusEl.className = "form-status is-visible " + (kind === "success" ? "is-success" : "is-error");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!validate()) {
      showStatus("error", t("service.err.form", "Uzupełnij poprawnie wymagane pola formularza."));
      return;
    }

    if (form._gotcha.value) {
      showSuccess();
      return;
    }

    var actionUrl = form.getAttribute("action") || "";
    if (actionUrl.indexOf(placeholderId) !== -1) {
      console.warn("[N-SYSTEM] Formspree ID formularza serwisowego nie został jeszcze skonfigurowany — podmień YOUR_SERVICE_FORM_ID w serwis.html.");
      showStatus("error", t("service.err.notConfigured", "Formularz nie jest jeszcze podłączony — zadzwoń do nas bezpośrednio."));
      return;
    }

    submitBtn.disabled = true;
    submitBtn.querySelector("span").textContent = t("service.sending", "Wysyłanie...");

    fetch(actionUrl, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    })
      .then(function (response) {
        if (response.ok) showSuccess();
        else showStatus("error", t("service.err.generic", "Coś poszło nie tak. Spróbuj ponownie lub zadzwoń do nas bezpośrednio."));
      })
      .catch(function () {
        showStatus("error", t("service.err.generic", "Coś poszło nie tak. Spróbuj ponownie lub zadzwoń do nas bezpośrednio."));
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.querySelector("span").textContent = t("service.submit", "Wyślij zgłoszenie");
      });
  });

  function showSuccess() {
    form.hidden = true;
    successPanel.classList.add("is-visible");
    successPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }
})();
