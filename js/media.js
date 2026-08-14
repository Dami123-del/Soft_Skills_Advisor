/* ==========================================================================
   INTERACTIVE MEDIA MODULE
   Two of the required interactive-media types live here:
     1) Image Hotspots — coordinate-based click regions drawn as an SVG
        overlay (no external image asset needed, so it always renders).
     2) Audio-based question — a custom-controlled <audio> player with
        play / pause / replay and a live progress bar.
   ========================================================================== */

/**
 * Build the SVG markup for a hotspot question and wire up click/keyboard
 * selection. Calls `onSelect(hotspotId)` when a region is chosen.
 */
function renderHotspotQuestion(container, question, onSelect) {
  const w = 560, h = 160;

  const shapes = question.hotspotOptions.map((opt) => `
    <g class="hotspot" tabindex="0" role="button"
       aria-label="${opt.label}" data-hotspot-id="${opt.id}">
      <rect x="${opt.x - 42}" y="${opt.y - 42}" width="84" height="84" fill="#eef1ea" stroke="#d7d9c9" stroke-width="2" rx="4"/>
      <image href="${opt.imageSrc}" x="${opt.x - 42}" y="${opt.y - 42}" width="84" height="84" preserveAspectRatio="xMidYMid slice"/>
      <text class="hotspot-label" x="${opt.x}" y="${opt.y + 62}" text-anchor="middle">${opt.label}</text>
    </g>`).join("");

  container.innerHTML = `
    <div class="hotspot-wrap">
      <svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="group"
           aria-label="Click the item that would help you most">
        <rect width="${w}" height="${h}" fill="#ffffff"/>
        ${shapes}
      </svg>
    </div>`;

  const groups = container.querySelectorAll(".hotspot");

  function selectHotspot(el) {
    groups.forEach((g) => g.classList.remove("selected"));
    el.classList.add("selected");
    onSelect(el.dataset.hotspotId);
  }

  groups.forEach((el) => {
    el.addEventListener("click", () => selectHotspot(el));
    // Coordinate-based interactive media must also be keyboard operable.
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectHotspot(el);
      }
    });
  });
}

/**
 * Build a custom audio player (play / pause / replay + progress) for the
 * audio-based question. `question.audioSrc` should point at a real file the
 * student drops into /assets/audio/ — until then the UI still degrades
 * gracefully (controls simply have nothing to play).
 */
function renderAudioQuestion(container, question) {
  container.innerHTML = `
    <div class="audio-card">
      <strong>🎧 Scenario audio</strong>
      <p style="margin:6px 0 0;font-size:0.85rem;">
        Press play to hear the scenario, then choose your response below.
      </p>
      <audio id="scenarioAudio" preload="metadata" src="${question.audioSrc}"></audio>
      <div class="audio-controls">
        <button type="button" class="audio-btn" id="audioPlayBtn" aria-label="Play">▶</button>
        <button type="button" class="audio-btn" id="audioReplayBtn" aria-label="Replay">⟲</button>
        <div class="audio-progress"><div class="audio-progress-fill" id="audioProgressFill"></div></div>
        <span class="audio-time" id="audioTime">0:00</span>
      </div>
    </div>`;

  const audio = container.querySelector("#scenarioAudio");
  const playBtn = container.querySelector("#audioPlayBtn");
  const replayBtn = container.querySelector("#audioReplayBtn");
  const fill = container.querySelector("#audioProgressFill");
  const timeLabel = container.querySelector("#audioTime");

  function formatTime(sec) {
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    const m = Math.floor(sec / 60);
    return `${m}:${s}`;
  }

  playBtn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play().catch(() => {
        // No audio file present yet (asset not added) — fail silently in the UI.
        timeLabel.textContent = "no file";
      });
      playBtn.textContent = "⏸";
      playBtn.setAttribute("aria-label", "Pause");
    } else {
      audio.pause();
      playBtn.textContent = "▶";
      playBtn.setAttribute("aria-label", "Play");
    }
  });

  replayBtn.addEventListener("click", () => {
    audio.currentTime = 0;
    audio.play().catch(() => {});
    playBtn.textContent = "⏸";
  });

  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    fill.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
    timeLabel.textContent = formatTime(audio.currentTime);
  });

  audio.addEventListener("ended", () => {
    playBtn.textContent = "▶";
    playBtn.setAttribute("aria-label", "Play");
  });
}
