/* ==========================================================================
   QUIZ DATA
   Central source of truth for the four soft-skill categories and the
   10-question bank. Kept separate from quiz.js so the content can be edited
   without touching the engine logic (separation of data vs behaviour).
   ========================================================================== */

// Metadata for each of the four categories: id must match the score keys
// produced by the scoring engine in quiz.js.
const CATEGORY_META = {
  communication: {
    label: "Communication",
    color: "#e3a857",
    blurb: "How clearly you share ideas and listen to others.",
    tips: [
      "Join a public-speaking or debate club to practice thinking on your feet.",
      "Volunteer to present your group's work in tutorials this semester.",
      "Record yourself explaining a concept and review it for clarity."
    ]
  },
  critical: {
    label: "Critical Thinking",
    color: "#2f7a6f",
    blurb: "How you break down problems and question assumptions.",
    tips: [
      "Pick one assignment this term and write a short 'assumptions log' before solving it.",
      "Try a logic puzzle or case-study competition to sharpen structured reasoning.",
      "Practice arguing the opposite side of your own opinion in study groups."
    ]
  },
  time: {
    label: "Time Management",
    color: "#5b7fb5",
    blurb: "How you plan, prioritise, and protect deadlines.",
    tips: [
      "Block your first two weeks of term into a simple weekly planner.",
      "Try the 2-minute rule: small tasks get done immediately, not queued.",
      "Set a personal deadline 2 days before each real deadline as a buffer."
    ]
  },
  leadership: {
    label: "Leadership",
    color: "#b5533c",
    blurb: "How you take initiative and support a team toward a goal.",
    tips: [
      "Put your name forward to coordinate your first group project.",
      "Shadow a class rep or society committee member for a semester.",
      "Practice giving one piece of constructive feedback a week to a peer."
    ]
  }
};

// Each option carries a `points` object — the category weight it contributes
// if selected. This is what the scoring engine in quiz.js aggregates.
const QUIZ_DATA = [
  {
    id: "q1",
    type: "choice",
    prompt: "Your group project has three conflicting ideas on day one. What's your first move?",
    options: [
      { text: "Ask each person to explain their reasoning before anyone decides", points: { communication: 3, critical: 1 } },
      { text: "List the pros and cons of each idea on a shared doc", points: { critical: 3 } },
      { text: "Suggest a quick vote to keep things moving", points: { leadership: 2, time: 1 } },
      { text: "Volunteer to merge the best parts of all three", points: { leadership: 3 } }
    ]
  },
  {
    id: "q2",
    type: "choice",
    prompt: "A lecturer's explanation confuses you mid-class. What do you do?",
    options: [
      { text: "Raise your hand and ask them to rephrase it", points: { communication: 3 } },
      { text: "Note the exact point of confusion to research after class", points: { critical: 2, time: 1 } },
      { text: "Message a classmate to compare notes later", points: { communication: 2 } },
      { text: "Try to work it out yourself from first principles", points: { critical: 3 } }
    ]
  },
  {
    id: "q3",
    type: "hotspot",
    prompt: "Click the item on this welcome-week desk that would help you most in week one.",
    // hotspot targets are drawn directly in the quiz page SVG; ids link option->points
    hotspotOptions: [
      { id: "planner", label: "Weekly planner", x: 60, y: 70,  points: { time: 3 } },
      { id: "notebook", label: "Debate notebook", x: 200, y: 70, points: { communication: 2, critical: 2 } },
      { id: "badge", label: "Society sign-up sheet", x: 340, y: 70, points: { leadership: 3 } },
      { id: "checklist", label: "Task checklist", x: 480, y: 70, points: { critical: 2, time: 1 } }
    ]
  },
  {
    id: "q4",
    type: "choice",
    prompt: "It's week 6 and three assignments land in the same week. What's your instinct?",
    options: [
      { text: "Break each assignment into daily sub-tasks on a calendar", points: { time: 3 } },
      { text: "Ask a lecturer if any deadline has flexibility", points: { communication: 2 } },
      { text: "Rank them by weight and do the highest-value one first", points: { critical: 2, time: 2 } },
      { text: "Organise a study session so everyone shares the load", points: { leadership: 2, communication: 1 } }
    ]
  },
  {
    id: "q5",
    type: "audio",
    prompt: "Listen to the short scenario, then choose how you'd respond.",
    audioSrc: "assets/audio/scenario-question.mp3",
    options: [
      { text: "Calmly explain your reasoning to the group", points: { communication: 3 } },
      { text: "Ask a clarifying question before responding", points: { critical: 2, communication: 1 } },
      { text: "Take charge and propose the next step", points: { leadership: 3 } },
      { text: "Suggest revisiting it once everyone has more information", points: { time: 2, critical: 1 } }
    ]
  },
  {
    id: "q6",
    type: "choice",
    prompt: "A teammate keeps missing agreed deadlines. What do you do?",
    options: [
      { text: "Talk to them privately about what's blocking them", points: { communication: 2, leadership: 1 } },
      { text: "Rework the plan so their part has more buffer time", points: { time: 3 } },
      { text: "Investigate whether the workload was fairly split", points: { critical: 2 } },
      { text: "Step in and reassign tasks to protect the deadline", points: { leadership: 3 } }
    ]
  },
  {
    id: "q7",
    type: "choice",
    prompt: "You disagree with a group decision that's already been made. What now?",
    options: [
      { text: "Raise your concern with evidence before it's finalised", points: { critical: 2, communication: 2 } },
      { text: "Support the group choice — momentum matters more here", points: { leadership: 1, time: 1 } },
      { text: "Ask for a two-minute round of feedback before locking it in", points: { communication: 3 } },
      { text: "Propose an alternative and let the group compare both", points: { leadership: 2, critical: 1 } }
    ]
  },
  {
    id: "q8",
    type: "choice",
    prompt: "How do you usually prepare for a big exam period?",
    options: [
      { text: "Build a revision timetable weeks in advance", points: { time: 3 } },
      { text: "Summarise each topic in your own words first", points: { critical: 3 } },
      { text: "Form or join a study group to teach each other", points: { communication: 2, leadership: 1 } },
      { text: "Set milestones and check progress every few days", points: { time: 2, critical: 1 } }
    ]
  },
  {
    id: "q9",
    type: "choice",
    prompt: "You're asked to lead a small orientation activity for new students. Your approach?",
    options: [
      { text: "Plan a clear run-of-show with timings in advance", points: { time: 2, leadership: 2 } },
      { text: "Open with a quick icebreaker to read the room", points: { communication: 3 } },
      { text: "Assign roles based on what energises each volunteer", points: { leadership: 3 } },
      { text: "Prepare backup activities in case the first one flops", points: { critical: 2, time: 1 } }
    ]
  },
  {
    id: "q10",
    type: "choice",
    prompt: "Looking back at group work in school, what were you known for?",
    options: [
      { text: "The one who kept everyone on schedule", points: { time: 3 } },
      { text: "The one who spotted flaws in the plan early", points: { critical: 3 } },
      { text: "The one who kept communication clear between everyone", points: { communication: 3 } },
      { text: "The one who rallied the team when motivation dropped", points: { leadership: 3 } }
    ]
  }
];
