/* ==========================================================================
   QUIZ ENGINE
   Drives quiz.html: renders each of the 10 questions (choice / hotspot /
   audio types), runs a 20-second countdown per question, and accumulates a
   multi-category score with speed and streak multipliers. Depends on
   quiz-data.js (content), timer.js (CountdownTimer) and media.js (hotspot
   + audio renderers), which are loaded before this file.
   ========================================================================== */

const QUESTION_SECONDS = 60;

// ---- Central quiz state ---------------------------------------------------
const state = {
  index: 0,
  scores: { communication: 0, critical: 0, time: 0, leadership: 0 },
  streak: 0,
  // One slot per question: null until answered, then
  // { pointsApplied, timedOut, selectedLabel }
  answers: new Array(QUIZ_DATA.length).fill(null)
};

let timer = null;
let pendingSelection = null; // points object staged before Next is pressed

// ---- DOM references --------------------------------------------------------
const els = {
  qIndex: document.getElementById("qIndex"),
  qTotal: document.getElementById("qTotal"),
  hikerName: document.getElementById("hikerName"),
  timerDisplay: document.getElementById("timerDisplay"),
  trailFill: document.getElementById("trailFill"),
  trailPin: document.getElementById("trailPin"),
  quizCard: document.getElementById("quizCard"),
  categoryHint: document.getElementById("categoryHint"),
  questionPrompt: document.getElementById("questionPrompt"),
  questionBody: document.getElementById("questionBody"),
  streakBadge: document.getElementById("streakBadge"),
  streakMult: document.getElementById("streakMult"),
  prevBtn: document.getElementById("prevBtn"),
  nextBtn: document.getElementById("nextBtn"),
  footerScore: document.getElementById("footerScore")
};

document.addEventListener("DOMContentLoaded", init);

function init() {
  els.qTotal.textContent = QUIZ_DATA.length;

  const profileRaw = sessionStorage.getItem("tsa_profile");
  if (profileRaw) {
    const profile = JSON.parse(profileRaw);
    els.hikerName.textContent = `Hiker: ${profile.fullName.split(" ")[0]}`;
  } else {
    els.hikerName.textContent = "Hiker: Guest";
  }

  els.prevBtn.addEventListener("click", () => goToQuestion(state.index - 1));
  els.nextBtn.addEventListener("click", handleNext);

  goToQuestion(0);
}

/* ---- Navigation ----------------------------------------------------------- */
function goToQuestion(index) {
  if (index < 0 || index >= QUIZ_DATA.length) return;
  if (timer) timer.stop();

  state.index = index;
  const question = QUIZ_DATA[index];
  pendingSelection = null;

  els.qIndex.textContent = index + 1;
  els.quizCard.classList.remove("locked-out");

  // Restart the card-in entrance animation on every question, not just on
  // first load: removing the class, forcing a reflow, then re-adding it
  // is the standard trick to make a CSS animation replay on the same node.
  els.quizCard.classList.remove("card-in-replay");
  void els.quizCard.offsetWidth; // force reflow
  els.quizCard.classList.add("card-in-replay");
  els.categoryHint.textContent = question.type === "hotspot"
    ? "Image hotspot · click a region"
    : question.type === "audio"
      ? "Audio scenario · listen first"
      : "Multiple choice";
  els.questionPrompt.textContent = question.prompt;
  updateTrail(index);
  els.prevBtn.disabled = index === 0;

  const alreadyAnswered = state.answers[index] !== null;
  renderQuestionBody(question, alreadyAnswered);

  if (alreadyAnswered) {
    // Read-only revisit: no timer, Next is immediately available.
    els.timerDisplay.textContent = "—:—";
    els.timerDisplay.classList.remove("warning");
    els.nextBtn.disabled = false;
  } else {
    els.nextBtn.disabled = true;
    startTimerForQuestion();
  }

  updateStreakBadge();
  updateFooterScore();
}

function handleNext() {
  if (state.index === QUIZ_DATA.length - 1) {
    finishQuiz();
  } else {
    goToQuestion(state.index + 1);
  }
}

/* ---- Rendering per question type ------------------------------------------ */
function renderQuestionBody(question, alreadyAnswered) {
  els.questionBody.innerHTML = "";

  if (question.type === "choice") {
    const list = document.createElement("div");
    list.className = "option-list";
    question.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "option";
      btn.innerHTML = `<span class="option-letter">${String.fromCharCode(65 + i)}</span><span>${opt.text}</span>`;
      if (alreadyAnswered) {
        btn.classList.add("locked");
      }
      btn.addEventListener("click", () => onOptionChosen(opt.points, opt.text, list));
      list.appendChild(btn);
    });
    els.questionBody.appendChild(list);
    if (alreadyAnswered) markLockedSelection(list, ".option");

  } else if (question.type === "hotspot") {
    const wrap = document.createElement("div");
    els.questionBody.appendChild(wrap);
    renderHotspotQuestion(wrap, question, (hotspotId) => {
      const opt = question.hotspotOptions.find((o) => o.id === hotspotId);
      onOptionChosen(opt.points, opt.label, wrap);
    });
    if (alreadyAnswered) markLockedSelection(wrap, ".hotspot");

  } else if (question.type === "audio") {
    const wrap = document.createElement("div");
    els.questionBody.appendChild(wrap);
    renderAudioQuestion(wrap, question);

    const list = document.createElement("div");
    list.className = "option-list";
    question.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "option";
      btn.innerHTML = `<span class="option-letter">${String.fromCharCode(65 + i)}</span><span>${opt.text}</span>`;
      btn.addEventListener("click", () => onOptionChosen(opt.points, opt.text, list));
      list.appendChild(btn);
    });
    els.questionBody.appendChild(list);
    if (alreadyAnswered) markLockedSelection(list, ".option");
  }
}

/** Re-apply the locked/selected look when revisiting an answered question. */
function markLockedSelection(container, selector) {
  const record = state.answers[state.index];
  container.querySelectorAll(selector).forEach((el) => {
    el.classList.add("locked");
    const label = el.getAttribute("aria-label") || el.textContent;
    if (record && record.selectedLabel && label && label.trim() === record.selectedLabel.trim()) {
      el.classList.add("selected");
    }
  });
}

/* ---- Timer ------------------------------------------------------------------ */
function startTimerForQuestion() {
  els.timerDisplay.classList.remove("warning", "locked");
  timer = new CountdownTimer(
    QUESTION_SECONDS,
    (remaining) => {
      const mm = Math.floor(Math.max(remaining, 0) / 60);
      const ss = (Math.max(remaining, 0) % 60).toString().padStart(2, "0");
      els.timerDisplay.textContent = `${mm}:${ss}`;
      els.timerDisplay.classList.toggle("warning", remaining <= 5 && remaining > 0);
    },
    handleTimeout
  );
  timer.start();
}

function handleTimeout() {
  // Timeout handling: lock all controls, trigger a visual warning, record
  // the current (empty) state, and auto-advance.
  els.timerDisplay.classList.remove("warning");
  els.timerDisplay.classList.add("locked");
  els.timerDisplay.textContent = "0:00";
  els.quizCard.classList.add("locked-out");
  els.questionBody.querySelectorAll(".option, .hotspot").forEach((el) => el.classList.add("locked"));

  state.answers[state.index] = { pointsApplied: {}, timedOut: true, selectedLabel: null };
  state.streak = 0; // a timeout always breaks the speed streak
  updateStreakBadge();
  updateFooterScore();

  els.nextBtn.disabled = false;
  els.nextBtn.textContent = state.index === QUIZ_DATA.length - 1 ? "See results →" : "Next waypoint →";

  setTimeout(() => { handleNext(); }, 1100);
}

/* ---- Scoring engine ----------------------------------------------------------- */
function onOptionChosen(pointsObj, label, container) {
  // Ignore re-clicks once this question has already been answered.
  if (state.answers[state.index] !== null) return;

  container.querySelectorAll(".option, .hotspot").forEach((el) => el.classList.remove("selected"));
  const chosenEl = [...container.querySelectorAll(".option, .hotspot")]
    .find((el) => (el.getAttribute("aria-label") || el.textContent).trim() === label.trim());
  if (chosenEl) chosenEl.classList.add("selected");

  timer.stop();

  // Speed bonus: answered with at least half the time still on the clock.
  const speedBonus = timer.remaining >= QUESTION_SECONDS / 2;
  const streakBonus = state.streak >= 3;
  const multiplier = 1 + (speedBonus ? 0.2 : 0) + (streakBonus ? 0.2 : 0);

  const pointsApplied = {};
  Object.entries(pointsObj || {}).forEach(([category, value]) => {
    const scaled = Math.round(value * multiplier * 10) / 10;
    pointsApplied[category] = scaled;
    state.scores[category] = Math.round((state.scores[category] + scaled) * 10) / 10;
  });

  state.streak = speedBonus ? state.streak + 1 : 0;
  state.answers[state.index] = { pointsApplied, timedOut: false, selectedLabel: label };

  els.questionBody.querySelectorAll(".option, .hotspot").forEach((el) => {
    if (!el.classList.contains("selected")) el.classList.add("locked");
  });

  updateStreakBadge();
  updateFooterScore();

  els.nextBtn.disabled = false;
  els.nextBtn.textContent = state.index === QUIZ_DATA.length - 1 ? "See results →" : "Next waypoint →";
}

function updateStreakBadge() {
  if (state.streak >= 2) {
    const mult = state.streak >= 3 ? "1.4" : "1.2";
    els.streakMult.textContent = mult;
    els.streakBadge.classList.add("show");
  } else {
    els.streakBadge.classList.remove("show");
  }
}

function updateFooterScore() {
  const total = Object.values(state.scores).reduce((a, b) => a + b, 0);
  els.footerScore.textContent = `Trail score so far: ${total.toFixed(1)} pts`;
}

/* ---- Progress trail (signature element) --------------------------------------- */
function updateTrail(index) {
  const totalLen = 960; // path from x=20 to x=980
  const fraction = QUIZ_DATA.length > 1 ? index / (QUIZ_DATA.length - 1) : 0;
  els.trailFill.setAttribute("stroke-dashoffset", String(totalLen - totalLen * fraction));
  els.trailPin.setAttribute("transform", `translate(${20 + totalLen * fraction},20)`);
}

/* ---- Finish -------------------------------------------------------------------- */
function finishQuiz() {
  const profileRaw = sessionStorage.getItem("tsa_profile");
  const profile = profileRaw ? JSON.parse(profileRaw) : { fullName: "Guest" };
  const timedOutCount = state.answers.filter((a) => a && a.timedOut).length;

  const payload = {
    profile,
    scores: state.scores,
    timedOutCount,
    completedAt: new Date().toISOString()
  };
  sessionStorage.setItem("tsa_results", JSON.stringify(payload));
  window.location.href = "results.html";
}
