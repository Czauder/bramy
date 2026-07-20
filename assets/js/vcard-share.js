/* ============================================================
   vcard-share.js — generowanie .vcf, link WhatsApp, Web Share API
   z fallbackiem, render kodu QR. Tylko wizytowka.html.
   ============================================================ */
(function () {
  "use strict";

  var CONTACT = {
    name: "GRODMAX",
    tagline: "Bramy, ogrodzenia i automatyka",
    phone: "+48500000000",
    phoneDisplay: "+48 500 000 000",
    email: "kontakt@grodmax.pl",
    address: "ul. Przykładowa 12, 05-500 Piaseczno",
    website: "https://grodmax.pl"
  };

  function t(key, fallback) {
    return (window.GRODMAX_I18N && window.GRODMAX_I18N.t(key)) || fallback;
  }

  function showToast(message) {
    var toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(showToast._timer);
    showToast._timer = window.setTimeout(function () { toast.classList.remove("is-visible"); }, 2600);
  }

  /* ---------- vCard (.vcf) ---------- */
  function buildVCard() {
    var lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      "N:;" + CONTACT.name + ";;;",
      "FN:" + CONTACT.name,
      "ORG:" + CONTACT.name,
      "TITLE:" + CONTACT.tagline,
      "TEL;TYPE=WORK,VOICE:" + CONTACT.phone,
      "EMAIL;TYPE=WORK:" + CONTACT.email,
      "ADR;TYPE=WORK:;;" + CONTACT.address + ";;;;",
      "URL:" + CONTACT.website,
      "END:VCARD"
    ];
    return lines.join("\r\n");
  }

  var addContactBtn = document.getElementById("addContactBtn");
  if (addContactBtn) {
    addContactBtn.addEventListener("click", function () {
      var blob = new Blob([buildVCard()], { type: "text/vcard;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "GRODMAX.vcf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      showToast(t("vcard.downloaded", "Kontakt pobrany — dodaj go w swojej aplikacji"));
    });
  }

  /* ---------- WhatsApp ---------- */
  var whatsappBtn = document.getElementById("whatsappBtn");
  if (whatsappBtn) {
    var message = encodeURIComponent("Dzień dobry, chciałbym/chciałabym zapytać o wycenę.");
    whatsappBtn.href = "https://wa.me/" + CONTACT.phone.replace("+", "") + "?text=" + message;
  }

  /* ---------- Udostępnij (Web Share API + fallback) ---------- */
  var shareBtn = document.getElementById("shareBtn");
  if (shareBtn) {
    shareBtn.addEventListener("click", function () {
      var shareData = {
        title: CONTACT.name,
        text: CONTACT.tagline,
        url: window.location.href
      };
      if (navigator.share) {
        navigator.share(shareData).catch(function () { /* użytkownik anulował — nic nie robimy */ });
        return;
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(window.location.href)
          .then(function () { showToast(t("vcard.copied", "Link skopiowany do schowka")); })
          .catch(function () { showToast(t("vcard.copyError", "Nie udało się skopiować linku")); });
      } else {
        showToast(t("vcard.copyError", "Nie udało się skopiować linku"));
      }
    });
  }

  /* ---------- Kod QR ---------- */
  var qrContainer = document.getElementById("qrCode");
  if (qrContainer && window.QRCode) {
    new window.QRCode(qrContainer, {
      text: window.location.href,
      width: 168,
      height: 168,
      colorDark: "#0b0b0d",
      colorLight: "#ffffff",
      correctLevel: window.QRCode.CorrectLevel.M
    });
  }
})();
