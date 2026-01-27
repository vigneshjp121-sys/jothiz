(() => {
  "use strict";

  const form = document.getElementById("enquiryForm");
  if (!form) return;

  const successMsg = document.getElementById("successMsg");
  const submitBtn = document.getElementById("submitBtn");

  const nameInput = document.getElementById("name");
  const phoneInput = document.getElementById("phone");
  const emailInput = document.getElementById("email");
  const messageInput = document.getElementById("message");
  const recaptchaToken = document.getElementById("recaptchaToken");
  const botField = form.querySelector('[name="company"]');

  const nameError = document.getElementById("nameError");
  const phoneError = document.getElementById("phoneError");
  const emailError = document.getElementById("emailError");
  const messageError = document.getElementById("messageError");

  let isSubmitting = false;
  const COOLDOWN_SECONDS = 30;
  const SITE_KEY = "6Ld5L1gsAAAAANznU_17Wn9cbvPO3OSeWy-Z1RZn";

  function sanitize(str) {
    return str.replace(/[<>]/g, "").trim();
  }

  function validateForm() {
    let valid = true;

    if (nameInput.value.trim().length < 2) {
      nameError.style.display = "block";
      valid = false;
    } else nameError.style.display = "none";

    const phonePattern = /^[6-9][0-9]{9}$/;
    if (!phonePattern.test(phoneInput.value.trim())) {
      phoneError.style.display = "block";
      valid = false;
    } else phoneError.style.display = "none";

    if (emailInput.value.trim() !== "" && !emailInput.checkValidity()) {
      emailError.style.display = "block";
      valid = false;
    } else emailError.style.display = "none";

    if (messageInput.value.trim().length < 10) {
      messageError.style.display = "block";
      valid = false;
    } else messageError.style.display = "none";

    return valid;
  }

  function isInCooldown() {
    const lastTime = localStorage.getItem("lastSubmitTime");
    if (!lastTime) return false;
    return (Date.now() - parseInt(lastTime, 10)) / 1000 < COOLDOWN_SECONDS;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (isSubmitting) return;
    if (botField && botField.value !== "") return;

    if (isInCooldown()) {
      alert("⏳ 30 விநாடிகள் கழித்து முயற்சிக்கவும்.");
      return;
    }

    if (!validateForm()) return;

    isSubmitting = true;
    submitBtn.disabled = true;

    grecaptcha.ready(() => {
      grecaptcha.execute(SITE_KEY, { action: "submit" }).then(async (token) => {
        recaptchaToken.value = token;

        const formData = new FormData(form);
        formData.set("name", sanitize(nameInput.value));
        formData.set("phone", sanitize(phoneInput.value));
        formData.set("email", sanitize(emailInput.value));
        formData.set("message", sanitize(messageInput.value));

        try {
          const response = await fetch(form.action, {
            method: "POST",
            body: formData,
            headers: { "Accept": "application/json" },
            credentials: "omit"
          });

          if (response.ok) {
            localStorage.setItem("lastSubmitTime", Date.now().toString());
            form.reset();
            successMsg.style.display = "block";
          } else {
            alert("❌ அனுப்ப முடியவில்லை.");
            submitBtn.disabled = false;
            isSubmitting = false;
          }

        } catch {
          alert("❌ Network error.");
          submitBtn.disabled = false;
          isSubmitting = false;
        }
      });
    });
  });

})();
