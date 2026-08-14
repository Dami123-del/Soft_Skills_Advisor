/* ==========================================================================
   CONTACT PAGE LOGIC
   Mirrors landing.js but for the feedback form: same validation engine,
   a different rule set (standard email rather than institutional, a
   required topic select, and a minimum-length message).
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  const status = document.getElementById("contactStatus");
  const phoneInput = document.getElementById("cphone");

  attachFieldValidation(document.getElementById("field-cname"), [
    Rules.required("Name"),
    Rules.name()
  ]);
  attachFieldValidation(document.getElementById("field-cemail"), [
    Rules.required("Email"),
    Rules.emailStandard()
  ]);
  // Phone is optional here — only validate the pattern if something was typed.
  attachFieldValidation(document.getElementById("field-cphone"), [
    { test: (v) => v === "" || REGEX.PHONE.test(v), message: "Enter a valid Mauritius number, e.g. 5712 3456." }
  ]);
  attachFieldValidation(document.getElementById("field-csubject"), [
    Rules.required("Topic")
  ]);
  attachFieldValidation(document.getElementById("field-cmessage"), [
    Rules.required("Message"),
    Rules.minMessage()
  ]);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const isValid = validateForm(form);

    if (!isValid) {
      status.textContent = "Please fix the highlighted fields before sending.";
      status.className = "form-status show error";
      return;
    }

    // No backend in this static deployment — confirm locally and reset.
    status.textContent = "Thanks — your feedback has been noted. We'll get back to you by email.";
    status.className = "form-status show success";
    form.reset();
    form.querySelectorAll(".field").forEach((f) => {
      f.classList.remove("is-valid", "is-invalid");
      delete f.dataset.touched;
    });
  });
});
