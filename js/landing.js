/* ==========================================================================
   LANDING PAGE LOGIC
   Wires the four preliminary-detail fields to the shared validation engine
   and, on a valid submit, stores the student's details in sessionStorage
   before sending them to the quiz.
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("prelimForm");
  const status = document.getElementById("prelimStatus");

  // Each field gets its own rule chain, evaluated top to bottom.
  attachFieldValidation(document.getElementById("field-name"), [
    Rules.required("Full name"),
    Rules.name()
  ]);
  attachFieldValidation(document.getElementById("field-email"), [
    Rules.required("Email"),
    Rules.emailInstitutional()
  ]);
  attachFieldValidation(document.getElementById("field-studentId"), [
    Rules.required("Student ID"),
    Rules.studentId()
  ]);
  attachFieldValidation(document.getElementById("field-phone"), [
    Rules.required("Phone number"),
    Rules.phone()
  ]);

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const isValid = validateForm(form);

    if (!isValid) {
      status.textContent = "Please fix the highlighted fields before continuing.";
      status.className = "form-status show error";
      return;
    }

    // Persist the student's profile for use on the results/contact pages.
    const profile = {
      fullName: document.getElementById("fullName").value.trim(),
      email: document.getElementById("email").value.trim(),
      studentId: document.getElementById("studentId").value.trim(),
      phone: document.getElementById("phone").value.trim()
    };
    sessionStorage.setItem("tsa_profile", JSON.stringify(profile));

    status.textContent = "Profile saved — loading your first waypoint…";
    status.className = "form-status show success";

    setTimeout(() => { window.location.href = "quiz.html"; }, 650);
  });
});
