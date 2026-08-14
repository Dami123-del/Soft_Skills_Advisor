# Trailhead — Soft Skills Advisor

A 4-page vanilla HTML/CSS/JS web app (scenario 2: Soft Skills Advisor) that
guides incoming students through a scenario quiz across four soft skills —
**Communication, Critical Thinking, Time Management, Leadership** — and
generates a personalised results profile with a Canvas radar chart.

## File structure

```
index.html          Landing page: intro + preliminary details form
quiz.html            10-question quiz: timer, trail progress, media questions
results.html         Canvas radar chart, score breakdown, recommendations
contact.html         Author info + validated feedback form

css/base.css          Shared: design tokens, reset, header/nav, footer, typography, buttons
css/landing.css        index.html only: hero, compass figure, category grid, form
css/quiz.css            quiz.html only: timer, trail progress, question cards, media
css/results.css          results.html only: canvas card, breakdown bars, recommendations
css/contact.css           contact.html only: author card, feedback form

  Note: the .form-card/.field styles are intentionally duplicated between
  landing.css and contact.css (rather than pulled into base.css) so each
  page's stylesheet is fully self-contained.

js/quiz-data.js       Question bank + category metadata (content only)
js/validation.js       Regex library + reusable real-time validation engine
js/landing.js           Wires validation to the landing page form
js/contact.js            Wires validation to the contact page form
js/timer.js               CountdownTimer class (setInterval/clearInterval)
js/media.js                Image hotspot + custom audio player renderers
js/quiz.js                  Quiz engine: rendering, timer, scoring
js/canvas.js                  Results page: radar chart + breakdown logic

assets/audio/          Drop your scenario-question.mp3 clip here
```

## Before you submit — things to personalise

1. **Audio asset:** add a real clip at `assets/audio/scenario-question.mp3`
   (question 5 in `js/quiz-data.js`). Update its `audioSrc` path if you rename it.
2. **Contact page:** replace the placeholder name, GitHub repo link, live
   GitHub Pages link and email in `contact.html`.
3. **Institutional email domain:** the regex in `js/validation.js`
   (`EMAIL_INSTITUTIONAL`) assumes `@bse.ac.mu` — adjust if needed.
4. Add real code comments where you personalise logic, and keep the existing
   inline comments — they're there to satisfy the "code documentation" and
   "code quality" criteria, not just for show.

## How this maps to the technical requirements

- **Form validation & regex:** `js/validation.js` — real-time `.is-valid`/
  `.is-invalid` toggling on `input`/`blur`, inline `.error-message` elements,
  regex for names, institutional/standard email, phone, student ID.
- **Interactive media (2 types):** `js/media.js` — SVG image hotspots
  (question 3) and a custom `<audio>` player with play/pause/replay
  (question 5).
- **Timer & scoring engine:** `js/timer.js` + the scoring logic in
  `js/quiz.js` — 20s per-question countdown, timeout lock + auto-advance,
  multi-category scoring object with speed and streak multipliers.
- **Canvas:** `js/canvas.js` draws a 4-axis radar chart from the quiz
  results using only the 2D Canvas API — no charting library.
- **Deployment:** push this folder to a public GitHub repo and enable
  GitHub Pages (Settings → Pages → Deploy from branch → `/root`).

## Running locally

No build step — just serve the folder, e.g.:

```
python3 -m http.server 8000
```

then open `http://localhost:8000/index.html`. (Opening `index.html`
directly via `file://` also works, except the audio question needs a real
served file to play.)
