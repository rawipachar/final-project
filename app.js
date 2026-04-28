/**
 * Task Manager — app.js
 * ─────────────────────────────────────────────────────────────
 * Full application logic for use in Google Antigravity (or any
 * modern browser with ES module support).
 *
 * Module structure:
 *   1. CONSTANTS & CONFIG
 *   2. DATA STORE  — in-memory task store + mock seed data
 *   3. API LAYER   — fetch wrappers (GET/POST/PUT /tasks)
 *   4. RECOMMENDATION ENGINE — AI scoring & sorting
 *   5. PROGRESS ENGINE — subtask progress calculations
 *   6. NAVIGATION  — layer transitions + swipe pager
 *   7. TIMER       — SVG ring countdown (requestAnimationFrame)
 *   8. PAGE 1      — dashboard (date strip + urgent + upcoming)
 *   9. PAGE 2      — task list (filters + expandable cards)
 *  10. DETAIL SCREEN — hero card + subtask sliders
 *  11. EDIT SHEET  — inline task editing
 *  12. ADD TASK    — calendar picker + form
 *  13. TOAST       — ephemeral notification
 *  14. BOOT        — initialise everything
 * ─────────────────────────────────────────────────────────────
 */

/* ═══════════════════════════════════════════════════════════
   1. CONSTANTS & CONFIG
═══════════════════════════════════════════════════════════ */
const ICONS = ['🎯','📝','🔧','📊','💡','🎨','📱','🖥','📋','⚡','🧶','🗂','🔍','✏️','🏆'];
const CIRC  = 2 * Math.PI * 72;          // SVG timer ring circumference (r=72)
const SHORT_THRESHOLD = 90;              // minutes — defines a "short" task
const API_BASE = '/tasks';               // Spring Boot REST endpoint base

/* ═══════════════════════════════════════════════════════════
   2. DATA STORE
═══════════════════════════════════════════════════════════ */

/**
 * tasks: { [dateStr: string]: Task[] }
 *
 * Task shape:
 * {
 *   id:        number,
 *   title:     string,
 *   priority:  'HIGH' | 'MEDIUM' | 'LOW',
 *   duration:  number,   // total minutes
 *   icon:      string,   // emoji
 *   done:      boolean,
 *   desc:      string,
 *   date:      string,   // YYYY-MM-DD (set when flattened)
 *   subtasks:  Subtask[]
 * }
 *
 * Subtask shape:
 * {
 *   id:          number,
 *   title:       string,
 *   description: string,
 *   duration:    number,  // hours
 *   progress:    number   // 0–100
 * }
 */
let tasks = {};

/** Make a subtask array from a shorthand descriptor array */
function makeSubtasks(descriptors) {
  return descriptors.map((d, i) => ({
    id:          i + 1,
    title:       d.name,
    description: d.desc || 'Lorem ipsum dolor sit amet, consectetur adipiscing',
    duration:    d.hours,
    progress:    d.prog || 0,
  }));
}

/** Seed the store with realistic mock data spanning several dates */
function seedMockData() {
  const put = (offset, arr) => { tasks[offsetDate(offset)] = arr; };

  put(-2, [
    {
      id: 101, title: 'Sprint Planning', priority: 'HIGH', duration: 60,
      icon: '⚡', done: false,
      desc: 'Plan the upcoming sprint. Review backlog items and assign story points.',
      subtasks: makeSubtasks([
        { name: 'Research',    hours: 2,  prog: 45 },
        { name: 'Draft1',      hours: 3,  prog: 30 },
        { name: 'Prototype',   hours: 10, prog: 40 },
        { name: 'Actual work', hours: 24, prog: 20 },
      ]),
    },
    {
      id: 102, title: 'Code Review', priority: 'MEDIUM', duration: 30,
      icon: '🔧', done: false, desc: 'Review open pull requests from the team.',
      subtasks: makeSubtasks([
        { name: 'Read PRs', hours: 1,   prog: 0 },
        { name: 'Comment',  hours: 0.5, prog: 0 },
      ]),
    },
    { id: 103, title: 'Email Catchup', priority: 'LOW', duration: 15, icon: '📱', done: false, desc: '', subtasks: [] },
  ]);

  put(-1, [
    {
      id: 201, title: 'Design System Audit', priority: 'HIGH', duration: 90,
      icon: '🎨', done: false,
      desc: 'Review all components for consistency with the new brand guidelines.',
      subtasks: makeSubtasks([
        { name: 'Audit Colors',  hours: 2, prog: 70 },
        { name: 'Typography',    hours: 3, prog: 50 },
        { name: 'Components',    hours: 5, prog: 10 },
      ]),
    },
    { id: 202, title: 'Update Changelog', priority: 'LOW', duration: 20, icon: '📝', done: false, desc: '', subtasks: [] },
  ]);

  put(0, [
    {
      id: 301, title: 'Final Prototype', priority: 'HIGH', duration: 120,
      icon: '🧶', done: false,
      desc: 'Complete the interactive prototype for the client demo on Friday.',
      subtasks: makeSubtasks([
        { name: 'Research',    hours: 2,  prog: 45 },
        { name: 'Draft1',      hours: 3,  prog: 30 },
        { name: 'Prototype',   hours: 10, prog: 40 },
        { name: 'Actual work', hours: 24, prog: 20 },
      ]),
    },
    {
      id: 302, title: 'Draft 2', priority: 'MEDIUM', duration: 80,
      icon: '📋', done: false, desc: 'Second draft of the quarterly report.',
      subtasks: makeSubtasks([
        { name: 'Outline', hours: 1, prog: 80 },
        { name: 'Write',   hours: 3, prog: 50 },
      ]),
    },
    { id: 303, title: 'Draft 6', priority: 'LOW', duration: 20, icon: '📊', done: false, desc: '', subtasks: [] },
  ]);

  put(1, [
    {
      id: 401, title: 'Client Presentation', priority: 'HIGH', duration: 90,
      icon: '🏆', done: false, desc: 'Present Q2 roadmap to stakeholders.',
      subtasks: makeSubtasks([
        { name: 'Slides',      hours: 3, prog: 0 },
        { name: 'Rehearsal',   hours: 1, prog: 0 },
        { name: 'Demo Setup',  hours: 2, prog: 0 },
      ]),
    },
    { id: 402, title: 'Slide Deck Review', priority: 'MEDIUM', duration: 45, icon: '🖥', done: false, desc: '', subtasks: [] },
  ]);

  put(2, [
    {
      id: 501, title: 'Architecture Review', priority: 'HIGH', duration: 150,
      icon: '🔍', done: false, desc: 'Full review of the new microservices architecture.',
      subtasks: makeSubtasks([
        { name: 'Read Docs',    hours: 3,  prog: 0 },
        { name: 'Diagram',      hours: 5,  prog: 0 },
        { name: 'Write Report', hours: 10, prog: 0 },
      ]),
    },
    { id: 502, title: 'Bug Triage',   priority: 'MEDIUM', duration: 40, icon: '🔧', done: false, desc: 'Go through open issues.', subtasks: [] },
    { id: 503, title: 'Docs Update',  priority: 'LOW',    duration: 25, icon: '📝', done: false, desc: '', subtasks: [] },
  ]);

  put(4, [
    {
      id: 601, title: 'Release Planning', priority: 'HIGH', duration: 75,
      icon: '🎯', done: false, desc: 'Plan v2.4 release — define scope, assign owners, set dates.',
      subtasks: makeSubtasks([
        { name: 'Scope',          hours: 2, prog: 0 },
        { name: 'Assign Owners',  hours: 1, prog: 0 },
        { name: 'Timeline',       hours: 2, prog: 0 },
      ]),
    },
    { id: 602, title: 'Team Retrospective', priority: 'MEDIUM', duration: 50, icon: '✏️', done: false, desc: '', subtasks: [] },
  ]);
}

/* ═══════════════════════════════════════════════════════════
   3. API LAYER
═══════════════════════════════════════════════════════════ */

/**
 * Fetch tasks for a given date from the Spring Boot backend.
 * Falls back gracefully — if the server is offline the in-memory
 * store is used instead (tasks are already seeded locally).
 *
 * GET /tasks?date=YYYY-MM-DD
 * Returns: Task[]
 */
async function apiFetchTasks(dateStr) {
  try {
    const res = await fetch(`${API_BASE}?date=${dateStr}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const serverTasks = await res.json();
    // Merge server tasks into local store (server is source of truth)
    tasks[dateStr] = serverTasks.map(t => ({
      ...t,
      subtasks: t.subtasks || [],
      icon: t.icon || ICONS[t.id % ICONS.length],
    }));
  } catch (_) {
    // Offline / no server — use in-memory data silently
  }
}

/**
 * POST /tasks
 * Body: { title, description, priority, duration, date }
 * Returns: { id, ...task }
 */
async function apiCreateTask(payload) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * PUT /tasks/:id
 * Body: { title, description, priority, duration }
 */
async function apiUpdateTask(id, payload) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/* ═══════════════════════════════════════════════════════════
   4. RECOMMENDATION ENGINE
═══════════════════════════════════════════════════════════ */

/**
 * Compute a numeric recommendation score for a task.
 *
 * Scoring matrix:
 *   HIGH   + SHORT (≤90m)  → 100  (do this first)
 *   MEDIUM + SHORT         →  80
 *   HIGH   + LONG  (>90m)  →  60
 *   MEDIUM + LONG          →  40
 *   LOW    + SHORT         →  30
 *   LOW    + LONG          →  10
 *
 * Tie-break: subtract a tiny fraction of duration so that
 * within the same bucket, shorter tasks rank first.
 *
 * @param {object} task
 * @returns {number}
 */
export function recommendationScore(task) {
  const isShort = task.duration <= SHORT_THRESHOLD;
  const priorityWeight = { HIGH: 3, MEDIUM: 2, LOW: 1 }[task.priority] || 1;

  const scoreTable = {
    '3-true':  100,   // HIGH + SHORT
    '2-true':   80,   // MEDIUM + SHORT
    '3-false':  60,   // HIGH + LONG
    '2-false':  40,   // MEDIUM + LONG
    '1-true':   30,   // LOW + SHORT
    '1-false':  10,   // LOW + LONG
  };

  const base = scoreTable[`${priorityWeight}-${isShort}`] ?? 10;
  return base - (task.duration / 10_000); // fractional tie-break
}

/**
 * Sort a task list by recommendation score (highest first).
 * Does NOT mutate the original array.
 *
 * @param {object[]} taskList
 * @returns {object[]}
 */
export function sortByRecommendation(taskList) {
  return [...taskList].sort((a, b) => recommendationScore(b) - recommendationScore(a));
}

/**
 * Tag the top-N incomplete tasks in a sorted list as recommended.
 * Returns a new array — original objects are not mutated.
 *
 * @param {object[]} sortedList
 * @param {number}   topN        how many tasks to highlight (default 3)
 * @returns {object[]}
 */
export function tagRecommended(sortedList, topN = 3) {
  let count = 0;
  return sortedList.map(t => ({
    ...t,
    isRecommended: !t.done && count++ < topN,
  }));
}

/* ═══════════════════════════════════════════════════════════
   5. PROGRESS ENGINE
═══════════════════════════════════════════════════════════ */

/**
 * Calculate overall task progress as the average of all subtask
 * progress values (0–100).
 * If there are no subtasks, returns 100 if done, else 0.
 *
 * @param {object} task
 * @returns {number} 0–100
 */
export function calcTotalProgress(task) {
  if (!task.subtasks || task.subtasks.length === 0) {
    return task.done ? 100 : 0;
  }
  const sum = task.subtasks.reduce((acc, s) => acc + s.progress, 0);
  return sum / task.subtasks.length;
}

/**
 * Calculate remaining work time in hours.
 *
 * Formula: remaining = totalSubtaskHours × (1 − totalProgress)
 * Falls back to task.duration (minutes → hours) when no subtasks.
 *
 * @param {object} task
 * @returns {number} hours remaining, rounded to 1 decimal
 */
export function calcRemainingHours(task) {
  if (!task.subtasks || task.subtasks.length === 0) {
    const ratio = task.done ? 0 : 1;
    return +((task.duration / 60) * ratio).toFixed(1);
  }
  const totalHours    = task.subtasks.reduce((acc, s) => acc + s.duration, 0);
  const totalProgress = calcTotalProgress(task) / 100;
  return +(totalHours * (1 - totalProgress)).toFixed(1);
}

/**
 * Apply the live slider value to a subtask and sync the UI.
 * Called on every `input` event from a range slider.
 *
 * @param {object} task     — the parent task object (mutated in place)
 * @param {number} subIdx   — index into task.subtasks
 * @param {number} value    — new progress value 0–100
 * @param {HTMLElement} sliderEl
 */
export function applySubtaskProgress(task, subIdx, value, sliderEl) {
  task.subtasks[subIdx].progress = value;
  updateSliderTrackStyle(sliderEl);
}

/**
 * Style a range slider so the filled (left) portion is red
 * and the unfilled (right) portion is the border colour.
 *
 * @param {HTMLInputElement} slider
 */
function updateSliderTrackStyle(slider) {
  const pct = `${slider.value}%`;
  slider.style.background =
    `linear-gradient(to right, var(--red) 0%, var(--red) ${pct}, var(--bd2) ${pct}, var(--bd2) 100%)`;
}

/* ═══════════════════════════════════════════════════════════
   UTILITY HELPERS
═══════════════════════════════════════════════════════════ */

const todayStr   = () => new Date().toISOString().split('T')[0];
const offsetDate = n  => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().split('T')[0]; };
const fmtFull    = s  => new Date(s + 'T00:00:00').toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric', year:'numeric' });
const fmtShort   = s  => { const d = new Date(s + 'T00:00:00'); return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getFullYear()).slice(2)}`; };

const findTask = id => Object.values(tasks).flat().find(t => t.id === id);
const findTaskDate = id => Object.entries(tasks).find(([, arr]) => arr.some(t => t.id === id))?.[0] || '';

/* ═══════════════════════════════════════════════════════════
   6. NAVIGATION
═══════════════════════════════════════════════════════════ */

let curPage   = 0;
let detailId  = null;
let editingId = null;

/**
 * Show a layer (L1, L2, L3), sliding all others left or right
 * depending on their relative position in the navigation stack.
 */
function showLayer(targetId) {
  const order = { L1: 0, L2: 1, L3: 2 };
  ['L1', 'L2', 'L3'].forEach(id => {
    const el = document.getElementById(id);
    el.classList.remove('active', 'slide-left', 'slide-right');
    if (id === targetId) {
      el.classList.add('active');
    } else {
      el.classList.add(order[id] < order[targetId] ? 'slide-left' : 'slide-right');
    }
  });
}

function goToAddTask()  { resetAddForm(); showLayer('L2'); }
function goBack()       { showLayer('L1'); setTimeout(() => { buildDateRow(); renderP1(); renderP2(); }, 60); }
function goToDetail(id) { detailId = id; renderDetailScreen(); showLayer('L3'); }
function backFromDetail() { showLayer('L1'); setTimeout(() => { renderP1(); renderP2(); }, 60); }

/* ── Swipe pager ── */
function gotoPage(n) {
  curPage = n;
  document.getElementById('pager').style.transform = `translateX(${-n * 100}%)`;
  document.querySelectorAll('.p-dot').forEach((d, i) => {
    d.className = 'p-dot ' + (i === n ? 'on' : 'off');
  });
  if (n === 1) { expandedId = null; renderP2(); }
}

function initPagerSwipe() {
  const pw = document.getElementById('pagerWrap');
  let sx = 0, moved = false;

  pw.addEventListener('touchstart', e => { sx = e.touches[0].clientX; moved = false; }, { passive: true });
  pw.addEventListener('touchmove',  () => { moved = true; }, { passive: true });
  pw.addEventListener('touchend',   e => {
    if (!moved) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 44) {
      if (dx < 0 && curPage < 1) gotoPage(1);
      else if (dx > 0 && curPage > 0) gotoPage(0);
    }
  });

  // Mouse drag for desktop / Antigravity browser preview
  let mx = 0, dragging = false;
  pw.addEventListener('mousedown', e => { mx = e.clientX; dragging = true; });
  window.addEventListener('mouseup', e => {
    if (!dragging) return; dragging = false;
    const dx = e.clientX - mx;
    if (Math.abs(dx) > 44) {
      if (dx < 0 && curPage < 1) gotoPage(1);
      else if (dx > 0 && curPage > 0) gotoPage(0);
    }
  });

  document.querySelectorAll('.p-dot').forEach(d =>
    d.addEventListener('click', () => gotoPage(+d.dataset.pg))
  );
}

/* ═══════════════════════════════════════════════════════════
   7. COUNTDOWN TIMER (SVG ring)
═══════════════════════════════════════════════════════════ */

let timerRAF   = null;
let timerStart = 0;
let timerDurMs = 0;

function stopTimer() {
  if (timerRAF) { cancelAnimationFrame(timerRAF); timerRAF = null; }
}

function startTimer(durationMinutes) {
  stopTimer();
  timerDurMs = durationMinutes * 60 * 1_000;
  timerStart = performance.now();
  animateTimer();
}

function animateTimer() {
  const fg  = document.getElementById('ringFg');
  const num = document.getElementById('timerNum');
  const lbl = document.getElementById('timerLbl');
  if (!fg) return;

  const elapsed   = performance.now() - timerStart;
  const remaining = Math.max(0, timerDurMs - elapsed);
  const fraction  = remaining / timerDurMs;

  fg.style.strokeDashoffset = CIRC * (1 - fraction);

  if (remaining <= 0) {
    fg.style.stroke   = '#4A0000';
    num.textContent   = 'Done';
    lbl.textContent   = "Time's up!";
    return;
  }

  const totalSecs = Math.ceil(remaining / 1_000);
  num.textContent  = Math.ceil(totalSecs / 60);  // minutes remaining

  const isWarning = totalSecs <= 120;
  fg.style.stroke = isWarning ? '#7A0000' : '#D92B2B';
  fg.classList.toggle('warn', isWarning);

  timerRAF = requestAnimationFrame(animateTimer);
}

/* ═══════════════════════════════════════════════════════════
   8. PAGE 1 — DASHBOARD
═══════════════════════════════════════════════════════════ */

let selDate = '';

function buildDateRow() {
  const row = document.getElementById('dateRow');
  row.innerHTML = '';
  const today = todayStr();

  for (let i = -3; i <= 7; i++) {
    const dateStr = offsetDate(i);
    const dt      = new Date(dateStr + 'T00:00:00');
    const hasTasks = (tasks[dateStr] || []).some(t => !t.done);

    const el = document.createElement('div');
    el.className = 'd-item'
      + (dateStr === today   ? ' today' : '')
      + (dateStr === selDate ? ' sel'   : '')
      + (hasTasks            ? ' has-t' : '');
    el.dataset.d = dateStr;
    el.innerHTML = `<div class="d-num">${dt.getDate()}</div><div class="d-pip"></div>`;
    el.addEventListener('click', () => selectMainDate(dateStr));
    row.appendChild(el);
  }

  const selected = row.querySelector('.sel');
  if (selected) selected.scrollIntoView({ inline: 'center', behavior: 'smooth' });
}

function selectMainDate(dateStr) {
  selDate = dateStr;
  const today = todayStr();
  const diff  = Math.round((new Date(dateStr) - new Date(today)) / 864e5);
  const dt    = new Date(dateStr + 'T00:00:00');
  document.getElementById('p1Lbl').textContent =
    diff ===  0 ? 'Today'   :
    diff ===  1 ? 'Tomorrow':
    diff === -1 ? 'Yesterday':
    dt.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  buildDateRow();
  renderP1();
}

function sortedForDate(dateStr) {
  const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  return (tasks[dateStr] || [])
    .slice()
    .sort((a, b) => order[a.priority] - order[b.priority]);
}

function renderP1() {
  const list   = sortedForDate(selDate);
  const urgent = list.find(t => !t.done && t.priority === 'HIGH') || list.find(t => !t.done);
  renderUrgent(urgent);
  renderUpcoming(list.filter(t => t !== urgent));
}

function renderUrgent(task) {
  const el = document.getElementById('urgentSec');
  if (!task) {
    stopTimer();
    el.innerHTML = '<div class="no-task">No urgent tasks today</div>';
    return;
  }

  el.innerHTML = `
    <div class="timer-wrap">
      <svg width="180" height="180" viewBox="0 0 180 180" style="overflow:visible">
        <circle class="ring-bg" cx="90" cy="90" r="72"/>
        <circle class="ring-fg" id="ringFg" cx="90" cy="90" r="72"
                stroke-dasharray="${CIRC}" stroke-dashoffset="0"/>
        <text class="t-num" id="timerNum" x="90" y="97">--</text>
        <text class="t-lbl" id="timerLbl" x="90" y="116">mins remaining</text>
      </svg>
    </div>
    <div class="tc urg">
      <div class="chk ${task.done ? 'done' : ''}" data-id="${task.id}"></div>
      <div class="t-ico">${task.icon}</div>
      <div class="t-info">
        <span class="badge-u">highest</span>
        <div class="t-name">${task.title}</div>
        <div class="t-meta">⏱ ${task.duration} mins work</div>
      </div>
      <div class="arr">›</div>
    </div>`;

  el.querySelector('.chk').addEventListener('click', e => {
    e.stopPropagation();
    toggleTask(+e.currentTarget.dataset.id);
  });
  startTimer(task.duration);
}

function renderUpcoming(list) {
  const el = document.getElementById('upcomingSec');
  if (!list.length) { el.innerHTML = '<div class="no-task">All done!</div>'; return; }

  const badgeMap = {
    HIGH:   '<span class="badge-u b-h">High</span>',
    MEDIUM: '<span class="badge-u b-m">Medium</span>',
    LOW:    '<span class="badge-u b-l">Low</span>',
  };

  el.innerHTML = list.map(t => `
    <div class="tc upc">
      <div class="chk ${t.done ? 'done' : ''}" data-id="${t.id}"></div>
      <div class="t-ico">${t.icon}</div>
      <div class="t-info">
        ${badgeMap[t.priority]}
        <div class="t-name">${t.done ? `<span style="text-decoration:line-through;opacity:.5">${t.title}</span>` : t.title}</div>
        <div class="t-meta">⏱ ${t.duration} mins work</div>
      </div>
      <div class="arr">›</div>
    </div>`).join('');

  el.querySelectorAll('.chk').forEach(x =>
    x.addEventListener('click', e => { e.stopPropagation(); toggleTask(+e.currentTarget.dataset.id); })
  );
}

function toggleTask(id) {
  Object.values(tasks).flat().forEach(t => { if (t.id === id) t.done = !t.done; });
  buildDateRow();
  renderP1();
  if (curPage === 1) renderP2();
}

/* ═══════════════════════════════════════════════════════════
   9. PAGE 2 — TASK LIST
═══════════════════════════════════════════════════════════ */

let activeFilter = 'all';
let expandedId   = null;

/** Return every task from every date, sorted by date then priority */
function allTasksSorted() {
  const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  return Object.entries(tasks)
    .flatMap(([date, arr]) => arr.map(t => ({ ...t, date })))
    .sort((a, b) =>
      a.date !== b.date
        ? (a.date < b.date ? -1 : 1)
        : order[a.priority] - order[b.priority]
    );
}

function groupByDate(list) {
  return list.reduce((map, t) => {
    if (!map[t.date]) map[t.date] = [];
    map[t.date].push(t);
    return map;
  }, {});
}

function groupLabel(dateStr) {
  const today = todayStr();
  const diff  = Math.round((new Date(dateStr) - new Date(today)) / 864e5);
  if (diff ===  0) return 'Today';
  if (diff ===  1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
}

/** Apply the active filter (all / high / rec) and return the result */
function applyFilter(list) {
  switch (activeFilter) {
    case 'high': return list.filter(t => t.priority === 'HIGH');
    case 'rec': {
      const nonDone = list.filter(t => !t.done);
      return tagRecommended(sortByRecommendation(nonDone));
    }
    default: return list;
  }
}

function renderP2() {
  const body = document.getElementById('p2Body');
  const all  = applyFilter(allTasksSorted());

  if (!all.length) {
    body.innerHTML = '<div class="no-task" style="padding:30px 0;text-align:center">No tasks found</div>';
    return;
  }

  const groups = groupByDate(all);
  const dates  = Object.keys(groups).sort();

  body.innerHTML = dates
    .map(d => `<div class="grp-label">${groupLabel(d)}</div>` + groups[d].map(t => buildExpandableCard(t, d)).join(''))
    .join('');

  // Wire up card interactions
  body.querySelectorAll('.e-card').forEach(card => {
    const id = +card.dataset.id;

    card.addEventListener('click', e => {
      if (e.target.closest('.e-btn')) return;
      if (expandedId === id) {
        goToDetail(id);              // second tap → detail screen
      } else {
        expandedId = id;
        document.querySelectorAll('.e-card').forEach(c =>
          c.classList.toggle('expanded', +c.dataset.id === id)
        );
      }
    });

    card.querySelector('.edit-task-btn')?.addEventListener('click', e => {
      e.stopPropagation(); openEditSheet(id);
    });
    card.querySelector('.complete-task-btn')?.addEventListener('click', e => {
      e.stopPropagation(); toggleTask(id); expandedId = null;
    });
  });
}

function buildExpandableCard(task, date) {
  const barCls   = task.priority === 'HIGH' ? 'bar-h' : task.priority === 'MEDIUM' ? 'bar-m' : 'bar-l';
  const badgeCls = task.priority === 'HIGH' ? 'b-h'   : task.priority === 'MEDIUM' ? 'b-m'   : 'b-l';
  const badgeTxt = task.priority === 'HIGH' ? 'High'  : task.priority === 'MEDIUM' ? 'Medium': 'Low';
  const icoBg    = task.priority === 'HIGH' ? 'var(--rl)' : task.priority === 'MEDIUM' ? 'var(--ol)' : 'var(--yl)';
  const isExp    = expandedId === task.id;
  const prog     = calcTotalProgress(task);

  const recBadge = task.isRecommended
    ? '<span class="rec-badge">🔥 Recommended</span><br>'
    : '';

  const miniProgress = task.subtasks?.length
    ? `<div class="mini-prog-wrap">
         <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--t2)">
           <span>Progress</span><span>${Math.round(prog)}%</span>
         </div>
         <div class="mini-prog-bar">
           <div class="mini-prog-fill" style="width:${prog}%"></div>
         </div>
       </div>`
    : '';

  return `
    <div class="e-card ${isExp ? 'expanded' : ''}" data-id="${task.id}">
      <div class="e-main">
        <div class="e-bar ${barCls}"></div>
        <div class="e-left">
          <div class="e-ico" style="background:${icoBg}">${task.icon}</div>
          <div class="e-info">
            ${recBadge}
            <span class="e-badge ${badgeCls}">${badgeTxt}</span>
            <div class="e-name">${task.done ? `<span style="text-decoration:line-through;opacity:.5">${task.title}</span>` : task.title}</div>
            <div class="e-meta">⏱ ${task.duration} mins work</div>
            ${miniProgress}
          </div>
        </div>
        <div class="e-arrow">›</div>
      </div>
      <div class="e-expand">
        <div class="e-expand-inner">
          <div class="e-deadline">📅 Deadline due on ${fmtShort(date)}</div>
          <div class="e-desc">${task.desc || '<span style="opacity:.4">No description.</span>'}</div>
          <div class="e-actions">
            <button class="e-btn edit-task-btn">✏️ Edit</button>
            <button class="e-btn primary complete-task-btn">${task.done ? 'Undo' : 'Complete'}</button>
          </div>
        </div>
      </div>
    </div>`;
}

/* ═══════════════════════════════════════════════════════════
   10. DETAIL SCREEN
═══════════════════════════════════════════════════════════ */

function renderDetailScreen() {
  const task = findTask(detailId);
  if (!task) return;
  const date = findTaskDate(detailId);

  const badgeCls = task.priority === 'HIGH' ? 'b-h' : task.priority === 'MEDIUM' ? 'b-m' : 'b-l';
  const badgeTxt = task.priority === 'HIGH' ? 'High' : task.priority === 'MEDIUM' ? 'Medium' : 'Low';
  const durationLabel = task.duration >= 60
    ? `${Math.round(task.duration / 60)} hrs`
    : `${task.duration} mins`;

  const subtasksHTML = (task.subtasks || []).map((s, i) => `
    <div class="subtask-item">
      <div class="subtask-header">
        <div class="sub-check ${s.progress >= 100 ? 'done' : ''}" data-sub="${i}"></div>
        <div class="sub-title-row">
          <span class="sub-name">${s.title}</span>
          <span class="sub-hours">${s.duration} hrs</span>
        </div>
      </div>
      <div class="sub-desc">${s.description}</div>
      <div class="sub-slider-wrap">
        <input type="range" class="sub-slider" data-sub="${i}" min="0" max="100" value="${Math.round(s.progress)}">
        <div class="sub-pct" id="subPct_${detailId}_${i}">${Math.round(s.progress)}%</div>
      </div>
    </div>`).join('');

  const noSubtasksMsg = !task.subtasks?.length
    ? '<p style="padding:0 18px 16px;font-size:13px;color:var(--t2)">No subtasks for this task.</p>'
    : '';

  document.getElementById('detailBody').innerHTML = `
    <div class="detail-hero-card">
      <div class="hero-check ${task.done ? 'done' : ''}" id="heroCheck"></div>
      <div class="hero-icon">${task.icon}</div>
      <div class="hero-info">
        <span class="hero-badge ${badgeCls}">${badgeTxt}</span>
        <div class="hero-title">${task.title}</div>
        <div class="hero-meta">⏱ ${durationLabel} work</div>
      </div>
      <button class="detail-edit-btn" id="detEditBtn" title="Edit task">✏️</button>
    </div>

    ${task.desc ? `<div class="detail-desc-block"><p class="detail-desc-text">${task.desc}</p></div>` : ''}

    <div class="progress-summary">
      <div class="prog-pct"  id="detProgPct">0%</div>
      <div class="prog-left" id="detProgLeft">0 hrs Left</div>
    </div>
    <div class="master-prog-wrap">
      <div class="master-prog-bar">
        <div class="master-prog-fill" id="detMasterFill" style="width:0%"></div>
      </div>
    </div>

    <div class="done-banner" id="doneBanner">🎉 All subtasks completed!</div>

    <div class="subtask-list">${subtasksHTML}${noSubtasksMsg}</div>

    <div class="detail-done-wrap">
      <button class="detail-done-btn" id="detDoneBtn">done</button>
    </div>
  `;

  // Initial progress display
  refreshDetailProgress(task);

  // Hero complete toggle
  document.getElementById('heroCheck').addEventListener('click', () => {
    toggleTask(detailId);
    renderDetailScreen();
  });

  // Edit button
  document.getElementById('detEditBtn').addEventListener('click', () => {
    backFromDetail();
    setTimeout(() => openEditSheet(detailId), 420);
  });

  // Done button
  document.getElementById('detDoneBtn').addEventListener('click', () => {
    toggleTask(detailId);
    const t = findTask(detailId);
    showToast(t?.done ? 'Task completed! 🎉' : 'Task reopened');
    renderDetailScreen();
  });

  // Subtask sliders
  document.querySelectorAll('.sub-slider').forEach(slider => {
    updateSliderTrackStyle(slider);

    const onSliderChange = () => {
      const subIdx = +slider.dataset.sub;
      const value  = +slider.value;

      // Mutate store
      applySubtaskProgress(task, subIdx, value, slider);

      // Update percentage label
      const pctEl = document.getElementById(`subPct_${detailId}_${subIdx}`);
      if (pctEl) pctEl.textContent = `${value}%`;

      // Update subtask check circle
      const checkEl = slider.closest('.subtask-item').querySelector('.sub-check');
      if (checkEl) {
        checkEl.classList.toggle('done', value >= 100);
        // Clear any stale ::after rendered by browser if needed
      }

      // Refresh totals
      refreshDetailProgress(task);

      // Sync mini progress bar on page 2 (if rendered)
      const miniEl = document.querySelector(`.e-card[data-id="${detailId}"] .mini-prog-fill`);
      if (miniEl) miniEl.style.width = `${calcTotalProgress(task)}%`;
    };

    slider.addEventListener('input',  onSliderChange);
    slider.addEventListener('change', onSliderChange);
  });

  // Sub-check circles: clicking toggles 0 ↔ 100
  document.querySelectorAll('.sub-check').forEach(chk => {
    chk.addEventListener('click', () => {
      const i      = +chk.dataset.sub;
      const slider = document.querySelector(`.sub-slider[data-sub="${i}"]`);
      if (!slider) return;
      const newVal = task.subtasks[i].progress >= 100 ? 0 : 100;
      slider.value = newVal;
      slider.dispatchEvent(new Event('input'));
    });
  });
}

/** Re-render the progress summary numbers without re-building the whole screen */
function refreshDetailProgress(task) {
  const pct  = Math.round(calcTotalProgress(task));
  const rem  = calcRemainingHours(task);
  const done = pct === 100;

  document.getElementById('detProgPct').textContent  = `${pct}%`;
  document.getElementById('detProgLeft').textContent = done ? '0 hrs Left' : `${rem} hrs Left`;
  document.getElementById('detMasterFill').style.width = `${pct}%`;

  document.getElementById('doneBanner').classList.toggle('show', done);

  const btn = document.getElementById('detDoneBtn');
  btn.textContent = done ? '✓ Completed' : 'done';
  btn.className   = 'detail-done-btn' + (done ? ' completed' : '');
}

/* ═══════════════════════════════════════════════════════════
   11. EDIT SHEET
═══════════════════════════════════════════════════════════ */

function openEditSheet(id) {
  editingId = id;
  const task = findTask(id);
  if (!task) return;

  document.getElementById('eName').value = task.title;
  document.getElementById('ePrio').value = task.priority;
  document.getElementById('eHrs').value  = Math.floor(task.duration / 60);
  document.getElementById('eMins').value = task.duration % 60;
  document.getElementById('eDesc').value = task.desc || '';
  document.getElementById('editOverlay').classList.add('open');
}

function initEditSheet() {
  document.getElementById('editCancel').addEventListener('click', () =>
    document.getElementById('editOverlay').classList.remove('open')
  );

  document.getElementById('editOverlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
  });

  document.getElementById('editSave').addEventListener('click', async () => {
    const task = findTask(editingId);
    if (!task) return;

    const title    = document.getElementById('eName').value.trim();
    if (!title) return;
    const hrs      = parseInt(document.getElementById('eHrs').value)  || 0;
    const mins     = parseInt(document.getElementById('eMins').value) || 0;
    const duration = Math.max(1, hrs * 60 + mins);
    const priority = document.getElementById('ePrio').value;
    const desc     = document.getElementById('eDesc').value.trim();

    try {
      await apiUpdateTask(editingId, { title, priority, duration, description: desc });
    } catch (_) { /* offline — update local only */ }

    task.title    = title;
    task.priority = priority;
    task.duration = duration;
    task.desc     = desc;

    document.getElementById('editOverlay').classList.remove('open');
    expandedId = null;
    buildDateRow();
    renderP1();
    renderP2();
    showToast('Task updated!');
  });
}

/* ═══════════════════════════════════════════════════════════
   12. ADD TASK FORM
═══════════════════════════════════════════════════════════ */

let calYear, calMonthIndex, calSelDate = '';
let formPrio = 'HIGH';

function resetAddForm() {
  const today = todayStr();
  calSelDate  = today;
  const d     = new Date(today + 'T00:00:00');
  calYear     = d.getFullYear();
  calMonthIndex = d.getMonth();
  buildCalendar();

  document.getElementById('fDeadline').value = fmtFull(today);
  document.getElementById('fName').value = '';
  document.getElementById('fName').classList.remove('err');
  document.getElementById('fNameErr').classList.remove('show');
  document.getElementById('fHrs').value  = '0';
  document.getElementById('fMins').value = '30';
  document.getElementById('fTimeErr').classList.remove('show');
  document.getElementById('fDesc').value = '';

  formPrio = 'HIGH';
  document.querySelectorAll('.p-opt').forEach(el => {
    el.className = 'p-opt';
    if (el.dataset.p === 'HIGH') el.classList.add('sel-h');
  });
}

function buildCalendar() {
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  document.getElementById('calMonth').textContent = `${MONTHS[calMonthIndex]} ${calYear}`;

  const grid      = document.getElementById('calGrid');
  grid.innerHTML  = '';
  const today     = todayStr();
  const firstDay  = new Date(calYear, calMonthIndex, 1).getDay();
  const daysInMon = new Date(calYear, calMonthIndex + 1, 0).getDate();
  const daysInPrev = new Date(calYear, calMonthIndex, 0).getDate();
  const cells     = [];

  for (let i = firstDay - 1; i >= 0; i--)
    cells.push({ d: daysInPrev - i, m: calMonthIndex - 1, y: calYear, other: true });

  for (let i = 1; i <= daysInMon; i++)
    cells.push({ d: i, m: calMonthIndex, y: calYear, other: false });

  while (cells.length % 7 !== 0)
    cells.push({ d: cells.length - daysInMon - firstDay + 1, m: calMonthIndex + 1, y: calYear, other: true });

  cells.forEach(c => {
    const mm  = ((c.m % 12) + 12) % 12;
    const yy  = c.m < 0 ? c.y - 1 : c.m > 11 ? c.y + 1 : c.y;
    const str = `${yy}-${String(mm + 1).padStart(2, '0')}-${String(c.d).padStart(2, '0')}`;

    const el  = document.createElement('div');
    el.className = 'c-day'
      + (c.other           ? ' other'    : '')
      + (str === today     ? ' is-today' : '')
      + (str === calSelDate? ' is-sel'   : '')
      + ((tasks[str] || []).length ? ' has-task' : '');
    el.textContent = c.d;
    el.addEventListener('click', () => {
      calSelDate = str;
      document.getElementById('fDeadline').value = fmtFull(str);
      buildCalendar();
    });
    grid.appendChild(el);
  });
}

function initAddTaskForm() {
  document.getElementById('calPrev').addEventListener('click', () => {
    calMonthIndex--;
    if (calMonthIndex < 0) { calMonthIndex = 11; calYear--; }
    buildCalendar();
  });

  document.getElementById('calNext').addEventListener('click', () => {
    calMonthIndex++;
    if (calMonthIndex > 11) { calMonthIndex = 0; calYear++; }
    buildCalendar();
  });

  document.querySelectorAll('.p-opt').forEach(el =>
    el.addEventListener('click', () => {
      formPrio = el.dataset.p;
      document.querySelectorAll('.p-opt').forEach(x => x.className = 'p-opt');
      el.classList.add(formPrio === 'HIGH' ? 'sel-h' : formPrio === 'MEDIUM' ? 'sel-m' : 'sel-lo');
    })
  );

  document.getElementById('submitBtn').addEventListener('click', async () => {
    let valid = true;
    const name = document.getElementById('fName').value.trim();

    if (!name) {
      document.getElementById('fName').classList.add('err');
      document.getElementById('fNameErr').classList.add('show');
      valid = false;
    } else {
      document.getElementById('fName').classList.remove('err');
      document.getElementById('fNameErr').classList.remove('show');
    }

    const hrs  = parseInt(document.getElementById('fHrs').value)  || 0;
    const mins = parseInt(document.getElementById('fMins').value) || 0;
    const totalMins = hrs * 60 + mins;

    if (totalMins <= 0) {
      document.getElementById('fTimeErr').classList.add('show');
      valid = false;
    } else {
      document.getElementById('fTimeErr').classList.remove('show');
    }

    if (!valid) return;

    const btn     = document.getElementById('submitBtn');
    btn.disabled  = true;
    btn.textContent = 'Saving…';

    const payload = {
      title:       name,
      description: document.getElementById('fDesc').value.trim(),
      priority:    formPrio,
      duration:    totalMins,
      date:        calSelDate,
    };

    try {
      const saved = await apiCreateTask(payload);
      addTaskLocally({ ...payload, id: saved.id || Date.now(), icon: ICONS[Math.floor(Math.random() * ICONS.length)], done: false, desc: payload.description, subtasks: [] });
    } catch (_) {
      addTaskLocally({ ...payload, id: Date.now(), icon: ICONS[Math.floor(Math.random() * ICONS.length)], done: false, desc: payload.description, subtasks: [] });
    }

    btn.disabled    = false;
    btn.textContent = "Let's get to work";

    if (!selDate || payload.date === selDate) selDate = payload.date;
    showToast('Task added!');
    goBack();
  });
}

function addTaskLocally(task) {
  if (!tasks[task.date]) tasks[task.date] = [];
  tasks[task.date].push(task);
}

/* ═══════════════════════════════════════════════════════════
   13. TOAST
═══════════════════════════════════════════════════════════ */

/**
 * Show a brief notification at the top of the screen.
 * Auto-dismisses after 2.4 seconds.
 *
 * @param {string} message
 */
export function showToast(message) {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2_400);
}

/* ═══════════════════════════════════════════════════════════
   14. BOOT
═══════════════════════════════════════════════════════════ */

function boot() {
  // Populate in-memory store with mock data
  seedMockData();

  // Set initial selected date to today
  selDate = todayStr();

  // Build UI
  buildDateRow();
  renderP1();

  // Wire up all interactive elements
  initPagerSwipe();
  initEditSheet();
  initAddTaskForm();

  // FAB → Add Task
  document.getElementById('fabBtn').addEventListener('click', goToAddTask);

  // Layer navigation
  document.getElementById('addBack').addEventListener('click', goBack);
  document.getElementById('detailBack').addEventListener('click', backFromDetail);

  // Filter tabs
  document.querySelectorAll('.f-tab').forEach(el =>
    el.addEventListener('click', () => {
      activeFilter = el.dataset.f;
      document.querySelectorAll('.f-tab').forEach(x => x.classList.remove('active'));
      el.classList.add('active');
      expandedId = null;
      renderP2();
    })
  );
}

boot();
