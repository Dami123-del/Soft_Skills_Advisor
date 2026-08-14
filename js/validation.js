/* ==========================================================================
   VALIDATION ENGINE
   A small, dependency-free real-time validator. Every field is wired to
   validate on `input` (as the student types) and `blur` (when they leave
   the field), toggling `.is-valid` / `.is-invalid` and writing the message
   into a `.error-message` element — never a native alert() popup.
   ========================================================================== */

/* ---- Regex library ------------------------------------------------------
   Kept here so every page (landing + contact) shares the exact same rules. */
const REGEX = {
  // Letters, spaces, hyphens and apostrophes only — blocks digits/symbols.
  NAME: /^[A-Za-z][A-Za-z\s'-]{1,49}$/,

  // Standard email shape: local@domain.tld
  EMAIL_STANDARD: /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/,

  // Institutional format: firstname.lastname@domain (accepts bse.ac.mu, alustudent.com, etc.)
  EMAIL_INSTITUTIONAL: /^[a-zA-Z][a-zA-Z0-9]*\.[a-zA-Z][a-zA-Z0-9]*@(bse\.ac\.mu|alustudent\.com)$/,

  // Mauritius-style mobile: optional +230, then 8 digits starting 5-9
  PHONE: /^(\+230[\s-]?)?[5-9]\d{3}[\s-]?\d{4}$/,

  // Student ID like BSE-24031 or CS-2024-118
  STUDENT_ID: /^[A-Za-z]{2,4}-\d{2,4}(-\d{2,4})?$/,

  // At least 8 characters, avoids feeling like a throwaway message
  MESSAGE_MIN: /^.{8,}$/s
};

/**
 * Wire up a single field for real-time validation.
 * @param {HTMLElement} fieldEl   the wrapper .field element
 * @param {Array<{test: (value:string)=>boolean, message:string}>} rules
 */
function attachFieldValidation(fieldEl, rules) {
  const input = fieldEl.querySelector("input, textarea, select");
  const errorEl = fieldEl.querySelector(".error-message");
  if (!input) return;

  function runValidation() {
    const value = input.value.trim();

    // Empty + untouched fields stay neutral rather than flashing red instantly.
    if (value === "" && !fieldEl.dataset.touched) {
      fieldEl.classList.remove("is-valid", "is-invalid");
      return true;
    }

    for (const rule of rules) {
      if (!rule.test(value)) {
        fieldEl.classList.add("is-invalid");
        fieldEl.classList.remove("is-valid");
        if (errorEl) errorEl.textContent = rule.message;
        input.setAttribute("aria-invalid", "true");
        return false;
      }
    }

    fieldEl.classList.add("is-valid");
    fieldEl.classList.remove("is-invalid");
    if (errorEl) errorEl.textContent = "";
    input.setAttribute("aria-invalid", "false");
    return true;
  }

  // `input` gives instant feedback as they type; `blur` catches the case
  // where they tab away without typing (e.g. leaving a required field empty).
  input.addEventListener("input", () => {
    fieldEl.dataset.touched = "true";
    runValidation();
  });
  input.addEventListener("blur", () => {
    fieldEl.dataset.touched = "true";
    runValidation();
  });

  // Expose the check so the submit handler can force-run it on every field.
  fieldEl._runValidation = runValidation;
}

/**
 * Validate every .field inside a form container. Returns true only if
 * every field passes. Also force-marks empty required fields as touched so
 * their errors render on submit even if the user never focused them.
 */
function validateForm(formEl) {
  const fields = formEl.querySelectorAll(".field");
  let allValid = true;
  fields.forEach((fieldEl) => {
    fieldEl.dataset.touched = "true";
    if (typeof fieldEl._runValidation === "function") {
      const ok = fieldEl._runValidation();
      if (!ok) allValid = false;
    }
  });
  return allValid;
}

/* Common rule builders, reused across landing.js and contact.js */
const Rules = {
  required(label) {
    return { test: (v) => v.length > 0, message: `${label} is required.` };
  },
  name() {
    return { test: (v) => REGEX.NAME.test(v), message: "Use letters only (no numbers or symbols)." };
  },
  emailStandard() {
    return { test: (v) => REGEX.EMAIL_STANDARD.test(v), message: "Enter a valid email address." };
  },
  emailInstitutional() {
    return {
      test: (v) => REGEX.EMAIL_STANDARD.test(v) && REGEX.EMAIL_INSTITUTIONAL.test(v),
      message: "Use your institutional email, e.g. first.name.lastname@university.com"
    };
  },
  phone() {
    return { test: (v) => REGEX.PHONE.test(v), message: "Enter a valid Mauritius number, e.g. 5712 3456." };
  },
  studentId() {
    return { test: (v) => REGEX.STUDENT_ID.test(v), message: "Format like BSE-24031." };
  },
  minMessage() {
    return { test: (v) => REGEX.MESSAGE_MIN.test(v), message: "Please write at least 8 characters." };
  }
};
