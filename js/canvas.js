/* ==========================================================================
   RESULTS CANVAS MODULE
   Reads the scoring payload left by quiz.js in sessionStorage and renders a
   4-axis radar/spider chart using the raw Canvas 2D API — no charting
   library. Also populates the text breakdown and recommendation panels.
   ========================================================================== */

const CATEGORY_ORDER = ["communication", "critical", "time", "leadership"];

document.addEventListener("DOMContentLoaded", () => {
  const raw = sessionStorage.getItem("tsa_results");

  if (!raw) {
    // Nobody has completed the quiz this session — guide them back instead
    // of drawing an empty/broken chart.
    document.getElementById("resultsHeading").textContent = "No trail results yet";
    document.getElementById("resultsSub").textContent =
      "We couldn't find a completed quiz in this session. Start the trail to generate your compass reading.";
    document.getElementById("retakeBtn").textContent = "Start the quiz →";
    document.getElementById("retakeBtn").href = "index.html";
    document.querySelector(".results-grid").style.display = "none";
    document.querySelector(".recommend-card").style.display = "none";
    return;
  }

  const data = JSON.parse(raw);
  const scores = data.scores;
  const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1;

  // Percentage share of each category relative to everything the student earned.
  const percentages = {};
  CATEGORY_ORDER.forEach((key) => { percentages[key] = (scores[key] / total) * 100; });

  const dominantKey = CATEGORY_ORDER.reduce((best, key) =>
    scores[key] > scores[best] ? key : best, CATEGORY_ORDER[0]);

  document.getElementById("resultsHeading").textContent =
    `${data.profile.fullName.split(" ")[0]}, your strongest waymarker is ${CATEGORY_META[dominantKey].label}`;
  document.getElementById("resultsSub").textContent =
    data.timedOutCount > 0
      ? `Based on your answers across all four categories (${data.timedOutCount} question${data.timedOutCount > 1 ? "s" : ""} timed out).`
      : "Based on your answers across all four categories.";

  drawRadarChart(document.getElementById("resultsCanvas"), percentages);
  renderLegend();
  renderBreakdown(scores, percentages);
  renderRecommendations(dominantKey);
});

/* ---- Legend --------------------------------------------------------------- */
function renderLegend() {
  const legend = document.getElementById("chartLegend");
  legend.innerHTML = CATEGORY_ORDER.map((key) => `
    <span><i style="background:${CATEGORY_META[key].color}"></i>${CATEGORY_META[key].label}</span>
  `).join("");
}

/* ---- Breakdown bars --------------------------------------------------------- */
function renderBreakdown(scores, percentages) {
  const list = document.getElementById("breakdownList");
  list.innerHTML = CATEGORY_ORDER.map((key) => `
    <div class="breakdown-item">
      <div class="row">
        <strong>${CATEGORY_META[key].label}</strong>
        <span>${scores[key].toFixed(1)} pts · ${percentages[key].toFixed(0)}%</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill" style="background:${CATEGORY_META[key].color}" data-target="${percentages[key]}"></div>
      </div>
    </div>
  `).join("");

  // Animate bars in on next frame so the CSS transition actually plays.
  requestAnimationFrame(() => {
    list.querySelectorAll(".bar-fill").forEach((bar) => {
      bar.style.width = `${bar.dataset.target}%`;
    });
  });
}

/* ---- Recommendations -------------------------------------------------------- */
function renderRecommendations(dominantKey) {
  const meta = CATEGORY_META[dominantKey];
  document.getElementById("dominantCategory").textContent = meta.label;
  document.getElementById("dominantBlurb").textContent = meta.blurb;
  document.getElementById("recommendList").innerHTML =
    meta.tips.map((tip) => `<li>${tip}</li>`).join("");
}

/* ---- Radar chart (Canvas 2D API, hand-drawn) --------------------------------- */
function drawRadarChart(canvas, percentages) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width, h = canvas.height;
  const cx = w / 2, cy = h / 2;
  const maxRadius = Math.min(w, h) / 2 - 60;
  const axisCount = CATEGORY_ORDER.length;
  const rings = 4; // 25 / 50 / 75 / 100 %

  ctx.clearRect(0, 0, w, h);

  // Point on the wheel for a given axis index (0 = top, clockwise) at a
  // given radius fraction (0..1).
  function pointAt(axisIndex, fraction) {
    const angle = (Math.PI * 2 * axisIndex) / axisCount - Math.PI / 2;
    return {
      x: cx + Math.cos(angle) * maxRadius * fraction,
      y: cy + Math.sin(angle) * maxRadius * fraction
    };
  }

  // Grid rings
  ctx.strokeStyle = "#d7d9c9";
  ctx.lineWidth = 1;
  for (let r = 1; r <= rings; r++) {
    const fraction = r / rings;
    ctx.beginPath();
    for (let i = 0; i <= axisCount; i++) {
      const p = pointAt(i % axisCount, fraction);
      i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }

  // Axis lines + labels
  ctx.strokeStyle = "#b9bfae";
  ctx.fillStyle = "#16233b";
  ctx.font = "600 13px Inter, sans-serif";
  CATEGORY_ORDER.forEach((key, i) => {
    const outer = pointAt(i, 1);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(outer.x, outer.y);
    ctx.stroke();

    const labelPoint = pointAt(i, 1.16);
    ctx.textAlign = i === 0 ? "center" : i === 2 ? "center" : i === 1 ? "left" : "right";
    ctx.fillText(CATEGORY_META[key].label, labelPoint.x, labelPoint.y);
  });

  // Data polygon, scaled so the highest category reaches ~92% of the outer ring
  // (keeps the shape readable even when one category dominates).
  const maxPct = Math.max(...Object.values(percentages), 1);
  const scale = 0.92 / (maxPct / 100);

  ctx.beginPath();
  CATEGORY_ORDER.forEach((key, i) => {
    const fraction = Math.min((percentages[key] / 100) * scale, 1);
    const p = pointAt(i, fraction);
    i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
  });
  ctx.closePath();
  ctx.fillStyle = "rgba(47, 122, 111, 0.28)";
  ctx.fill();
  ctx.strokeStyle = "#2f7a6f";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Vertex dots in each category's own colour
  CATEGORY_ORDER.forEach((key, i) => {
    const fraction = Math.min((percentages[key] / 100) * scale, 1);
    const p = pointAt(i, fraction);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = CATEGORY_META[key].color;
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

  // Centre point
  ctx.beginPath();
  ctx.arc(cx, cy, 3, 0, Math.PI * 2);
  ctx.fillStyle = "#16233b";
  ctx.fill();
}
