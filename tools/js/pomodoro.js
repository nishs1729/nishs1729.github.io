/**
 * Pomodoro Timer — Redesigned
 * Features: modes (focus/short/long), circular progress, stats,
 *           settings, notifications, sound, keyboard shortcuts,
 *           localStorage persistence, absolute timestamps,
 *           mobile swipe-to-adjust-time with tick feedback.
 */

'use strict';

// ── DOM refs ─────────────────────────────────────────────────────────────────
const timeDisplay    = document.getElementById('timeDisplay');
const ringProgress   = document.getElementById('ringProgress');
const startBtn       = document.getElementById('startBtn');
const resetBtn       = document.getElementById('resetBtn');
const skipBtn        = document.getElementById('skipBtn');
const sessionLabel   = document.getElementById('sessionLabel');
const cycleDots      = document.getElementById('cycleDots');
const statPomos      = document.getElementById('statPomos');
const statFocusMins  = document.getElementById('statFocusMins');
const statCycle      = document.getElementById('statCycle');
const pmNotif        = document.getElementById('pmNotif');

// Settings inputs
const setFocus        = document.getElementById('setFocus');
const setShort        = document.getElementById('setShort');
const setLong         = document.getElementById('setLong');
const setCycles       = document.getElementById('setCycles');
const toggleSound     = document.getElementById('toggleSound');
const toggleAutostart = document.getElementById('toggleAutostart');
const toggleNotify    = document.getElementById('toggleNotify');

// Mode buttons
const modeBtns = document.querySelectorAll('.pm-mode-btn');

// Collapsible settings panel
const settingsHeader = document.getElementById('settingsHeader');
const settingsBody   = document.getElementById('settingsBody');

// ── Ring circumference (r=100, 2πr ≈ 628.3) ──────────────────────────────────
const CIRCUMFERENCE = 2 * Math.PI * 100;

// ── Mode metadata ─────────────────────────────────────────────────────────────
const MODES = {
  focus: { label: 'Focus Time',    color: 'var(--pm-focus-color)', soft: 'var(--pm-focus-soft)' },
  short: { label: 'Short Break 🌿', color: 'var(--pm-break-color)', soft: 'var(--pm-break-soft)' },
  long:  { label: 'Long Break ☕',  color: 'var(--pm-long-color)',  soft: 'var(--pm-long-soft)'  },
};

// ── Default settings ──────────────────────────────────────────────────────────
const DEFAULTS = {
  settings: {
    focus: 25, short: 5, long: 15, cycles: 4,
    sound: true, autostart: false, notify: true,
  },
  timer: {
    mode: 'focus',
    running: false,
    endTime: null,
    remainingMs: 25 * 60 * 1000,
    completedFocus: 0,    // focus sessions completed within current cycle
    totalPomos: 0,
    totalFocusMins: 0,
    statsDate: '',        // YYYY-MM-DD for daily reset
  },
};

// ── State ─────────────────────────────────────────────────────────────────────
let settings     = { ...DEFAULTS.settings };
let timer        = { ...DEFAULTS.timer };
let tickInterval = null;
let notifTimeout = null;

const STORAGE = {
  settings: 'pomo_settings_v2',
  timer:    'pomo_timer_v2',
};

// ── Persistence ───────────────────────────────────────────────────────────────
function save() {
  try {
    localStorage.setItem(STORAGE.settings, JSON.stringify(settings));
    localStorage.setItem(STORAGE.timer,    JSON.stringify(timer));
  } catch(e) {}
}

function load() {
  try {
    const s = localStorage.getItem(STORAGE.settings);
    if (s) settings = { ...DEFAULTS.settings, ...JSON.parse(s) };

    const t = localStorage.getItem(STORAGE.timer);
    if (t) timer = { ...DEFAULTS.timer, ...JSON.parse(t) };
  } catch(e) {}
}

// ── Daily stats reset ─────────────────────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function checkDailyReset() {
  const today = todayStr();
  if (timer.statsDate !== today) {
    timer.totalPomos     = 0;
    timer.totalFocusMins = 0;
    timer.statsDate      = today;
  }
}

// ── Format helpers ────────────────────────────────────────────────────────────
function formatMs(ms) {
  if (ms < 0) ms = 0;
  const s  = Math.ceil(ms / 1000);
  const mm = Math.floor(s / 60).toString().padStart(2, '0');
  const ss = (s % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

// ── Ring progress ─────────────────────────────────────────────────────────────
function updateRing(fraction) {
  // fraction: 1 = full ring, 0 = empty
  ringProgress.style.strokeDashoffset = CIRCUMFERENCE * (1 - fraction);
}

// ── Cycle dots ────────────────────────────────────────────────────────────────
function renderCycleDots() {
  const total = settings.cycles;
  const done  = timer.completedFocus % settings.cycles;
  cycleDots.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('div');
    dot.className = 'pm-dot' + (i < done ? ' done' : '');
    cycleDots.appendChild(dot);
  }
}

// ── Mode colors ───────────────────────────────────────────────────────────────
function applyModeColors(mode) {
  const m = MODES[mode];
  ringProgress.style.stroke = m.color;
  document.documentElement.style.setProperty('--pm-accent',      m.color);
  document.documentElement.style.setProperty('--pm-accent-soft', m.soft);
  sessionLabel.textContent = m.label;
  sessionLabel.style.color = m.color;
}

// ── Mode duration (ms) ────────────────────────────────────────────────────────
function modeDurationMs(mode) {
  const mins = mode === 'focus' ? settings.focus
             : mode === 'short' ? settings.short
             : settings.long;
  return mins * 60 * 1000;
}

// ── Update all UI ─────────────────────────────────────────────────────────────
function updateUI() {
  // Remaining time (absolute timestamp keeps it accurate even when backgrounded)
  if (timer.running && timer.endTime) {
    timer.remainingMs = Math.max(0, timer.endTime - Date.now());
  }

  timeDisplay.textContent = formatMs(timer.remainingMs);

  // Ring fraction
  const total    = modeDurationMs(timer.mode);
  const fraction = total > 0 ? Math.max(0, Math.min(1, timer.remainingMs / total)) : 0;
  updateRing(fraction);

  // Play / Pause button
  startBtn.textContent = timer.running ? '⏸' : '▶';
  startBtn.classList.toggle('running', timer.running);
  startBtn.setAttribute('aria-label', timer.running ? 'Pause timer (Space)' : 'Start timer (Space)');

  // Stats
  statPomos.textContent     = timer.totalPomos;
  statFocusMins.textContent = Math.round(timer.totalFocusMins) + 'm';
  statCycle.textContent     = Math.floor(timer.completedFocus / settings.cycles) + 1;

  renderCycleDots();

  // Browser tab title
  document.title = timer.running
    ? `${formatMs(timer.remainingMs)} — Pomodoro`
    : 'Pomodoro Timer';

  // Toggle body class so CSS can hide the swipe-hint while running
  document.body.classList.toggle('pm-timer-running', timer.running);
}

// ── Tick ──────────────────────────────────────────────────────────────────────
function tick() {
  updateUI();
  if (timer.running && timer.remainingMs <= 0) {
    onSessionEnd();
  }
}

function startTick() {
  if (tickInterval) clearInterval(tickInterval);
  tickInterval = setInterval(tick, 300);
  tick();
}

function clearTick() {
  if (tickInterval) { clearInterval(tickInterval); tickInterval = null; }
}

// ── Start / Pause ─────────────────────────────────────────────────────────────
function startPause() {
  if (timer.running) {
    timer.remainingMs = Math.max(0, (timer.endTime || Date.now()) - Date.now());
    timer.running = false;
    timer.endTime = null;
    clearTick();
    releaseWakeLock();
  } else {
    if (timer.remainingMs <= 0) {
      timer.remainingMs = modeDurationMs(timer.mode);
    }
    timer.endTime = Date.now() + timer.remainingMs;
    timer.running = true;
    startTick();
    requestWakeLock();
  }
  save();
  updateUI();
}

// ── Reset ─────────────────────────────────────────────────────────────────────
function resetTimer() {
  timer.running     = false;
  timer.endTime     = null;
  timer.remainingMs = modeDurationMs(timer.mode);
  clearTick();
  releaseWakeLock();
  save();
  updateUI();
}

// ── Skip ──────────────────────────────────────────────────────────────────────
function skipSession() {
  clearTick();
  timer.running = false;
  timer.endTime = null;
  advanceMode();
  save();
  updateUI();
}

// ── Session end ───────────────────────────────────────────────────────────────
function onSessionEnd() {
  clearTick();
  releaseWakeLock();

  if (timer.mode === 'focus') {
    timer.completedFocus++;
    timer.totalPomos++;
    timer.totalFocusMins += settings.focus;
  }

  notifyEnd();
  showToast(timer.mode === 'focus' ? '🍅 Focus session complete!' : '⏰ Break over — time to focus!');
  advanceMode();

  if (settings.autostart) {
    setTimeout(() => {
      timer.endTime = Date.now() + timer.remainingMs;
      timer.running = true;
      startTick();
      requestWakeLock();
    }, 800);
  }

  save();
  updateUI();
}

// ── Advance to next mode ──────────────────────────────────────────────────────
function advanceMode() {
  let nextMode;
  if (timer.mode === 'focus') {
    nextMode = (timer.completedFocus % settings.cycles === 0 && timer.completedFocus > 0)
               ? 'long' : 'short';
  } else {
    nextMode = 'focus';
  }
  setMode(nextMode);
}

// ── Switch mode ───────────────────────────────────────────────────────────────
function setMode(mode) {
  timer.running     = false;
  timer.endTime     = null;
  timer.mode        = mode;
  timer.remainingMs = modeDurationMs(mode);
  clearTick();
  releaseWakeLock();
  applyModeColors(mode);

  modeBtns.forEach(btn => {
    const active = btn.dataset.mode === mode;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', active ? 'true' : 'false');
  });
}

// ── Settings sync ─────────────────────────────────────────────────────────────
function syncSettingsUI() {
  setFocus.value          = settings.focus;
  setShort.value          = settings.short;
  setLong.value           = settings.long;
  setCycles.value         = settings.cycles;
  toggleSound.checked     = settings.sound;
  toggleAutostart.checked = settings.autostart;
  toggleNotify.checked    = settings.notify;
}

function onSettingChange() {
  settings.focus     = Math.max(1, Math.min(120, parseInt(setFocus.value)  || 25));
  settings.short     = Math.max(1, Math.min(60,  parseInt(setShort.value)  || 5));
  settings.long      = Math.max(1, Math.min(120, parseInt(setLong.value)   || 15));
  settings.cycles    = Math.max(1, Math.min(10,  parseInt(setCycles.value) || 4));
  settings.sound     = toggleSound.checked;
  settings.autostart = toggleAutostart.checked;
  settings.notify    = toggleNotify.checked;

  // Clamp displayed values
  setFocus.value  = settings.focus;
  setShort.value  = settings.short;
  setLong.value   = settings.long;
  setCycles.value = settings.cycles;

  // If not running, reset current mode's remaining time to match new duration
  if (!timer.running) {
    timer.remainingMs = modeDurationMs(timer.mode);
  }

  save();
  renderCycleDots();
  updateUI();
}

// ── Collapsible settings panel ────────────────────────────────────────────────
function togglePanel(header, body) {
  const isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  header.classList.toggle('open', !isOpen);
  header.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
}

settingsHeader.addEventListener('click', () => togglePanel(settingsHeader, settingsBody));
settingsHeader.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); togglePanel(settingsHeader, settingsBody); }
});

// ── Toast ─────────────────────────────────────────────────────────────────────
function showToast(msg, duration = 3500) {
  pmNotif.textContent = msg;
  pmNotif.classList.add('show');
  if (notifTimeout) clearTimeout(notifTimeout);
  notifTimeout = setTimeout(() => pmNotif.classList.remove('show'), duration);
}

// ── Notifications & sound ─────────────────────────────────────────────────────
function notifyEnd() {
  if ('vibrate' in navigator) navigator.vibrate([180, 60, 180]);

  if (settings.sound) playBell();

  if (settings.notify && 'Notification' in window) {
    const body = timer.mode === 'focus'
      ? `Great work! Time for a ${timer.completedFocus % settings.cycles === 0 ? 'long' : 'short'} break.`
      : 'Break over — ready to focus?';
    if (Notification.permission === 'granted') {
      const n = new Notification('Pomodoro', { body, silent: true });
      setTimeout(() => n.close(), 8000);
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(p => {
        if (p === 'granted') new Notification('Pomodoro', { body, silent: true });
      });
    }
  }
}

// ── Bell (Web Audio API — C5/E5/G5 arpeggio) ──────────────────────────────────
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playBell() {
  try {
    const ctx   = getAudioCtx();
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.08);
      osc.stop(ctx.currentTime + i * 0.08 + 1.3);
    });
  } catch(e) {}
}

// ── Tick sound (short mechanical click for scroll adjustment) ─────────────────
function playTick(direction) {
  try {
    const ctx  = getAudioCtx();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    // slightly higher pitch when scrolling up (adding time), lower when down
    osc.type = 'sine';
    osc.frequency.value = direction > 0 ? 1050 : 820;
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.07);
  } catch(e) {}
}

// ── Mobile swipe-to-adjust time ───────────────────────────────────────────────
// Attach touch listeners to the ring area so users can swipe up/down
// to change the current session's duration (1 min per ~30 px of movement).
// Only active when the timer is not running.
(function initSwipeAdjust() {
  const ringWrap = document.querySelector('.pm-ring-wrap');
  if (!ringWrap) return;

  const PX_PER_MINUTE = 30;   // pixels of swipe per minute change
  let touchStartY   = null;
  let accumulatedDy = 0;      // accumulated unprocessed pixels
  let isSwiping     = false;

  ringWrap.addEventListener('touchstart', e => {
    if (timer.running) return;
    touchStartY   = e.touches[0].clientY;
    accumulatedDy = 0;
    isSwiping     = true;
    // Wake up AudioContext on first user gesture
    try { getAudioCtx(); } catch(_) {}
  }, { passive: true });

  ringWrap.addEventListener('touchmove', e => {
    if (!isSwiping || timer.running || touchStartY === null) return;
    e.preventDefault();   // prevent page scroll while adjusting

    const currentY = e.touches[0].clientY;
    const delta    = touchStartY - currentY;  // total from start; positive = swipe up = add time

    // How many minute steps have been crossed since last check?
    const steps = Math.trunc(delta / PX_PER_MINUTE);
    const prev  = Math.trunc(accumulatedDy / PX_PER_MINUTE);

    if (steps !== prev) {
      const diff = steps - prev;
      adjustTimeByMinutes(diff);
    }
    accumulatedDy = delta;
  }, { passive: false });

  ringWrap.addEventListener('touchend', () => {
    isSwiping   = false;
    touchStartY = null;
    accumulatedDy = 0;
    save();
  }, { passive: true });

  ringWrap.addEventListener('touchcancel', () => {
    isSwiping   = false;
    touchStartY = null;
    accumulatedDy = 0;
  }, { passive: true });
}());

function adjustTimeByMinutes(deltaMinutes) {
  if (timer.running) return;

  const minMs  = 60 * 1000;          // 1 minute in ms
  const maxMs  = 120 * 60 * 1000;   // 120 min cap
  const newMs  = Math.max(minMs, Math.min(maxMs, timer.remainingMs + deltaMinutes * minMs));

  if (newMs === timer.remainingMs) return; // already at boundary — skip tick

  timer.remainingMs = newMs;
  playTick(deltaMinutes);
  updateUI();
}

// ── Wake Lock ─────────────────────────────────────────────────────────────────
let wakeLock = null;
async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; });
    }
  } catch(e) { wakeLock = null; }
}
async function releaseWakeLock() {
  if (wakeLock) { try { await wakeLock.release(); } catch(e) {} wakeLock = null; }
}

// ── Keyboard shortcuts ────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
  switch(e.key) {
    case ' ':             e.preventDefault(); startPause(); break;
    case 'r': case 'R':  resetTimer();  break;
    case 's': case 'S':  skipSession(); break;
    case '1': setMode('focus'); save(); updateUI(); break;
    case '2': setMode('short'); save(); updateUI(); break;
    case '3': setMode('long');  save(); updateUI(); break;
  }
});

// ── Event wiring ──────────────────────────────────────────────────────────────
startBtn.addEventListener('click', startPause);
resetBtn.addEventListener('click', resetTimer);
skipBtn.addEventListener('click',  skipSession);

modeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (!timer.running) {
      setMode(btn.dataset.mode);
      save();
      updateUI();
    } else {
      showToast('⚠️ Pause the timer first to switch modes.');
    }
  });
});

[setFocus, setShort, setLong, setCycles, toggleSound, toggleAutostart, toggleNotify]
  .forEach(el => el.addEventListener('change', onSettingChange));

// Re-sync when tab becomes visible again
document.addEventListener('visibilitychange', () => { if (!document.hidden) updateUI(); });

window.addEventListener('beforeunload', save);

// ── Notification permission ───────────────────────────────────────────────────
function maybeRequestNotifyPermission() {
  if ('Notification' in window && Notification.permission === 'default' && settings.notify) {
    Notification.requestPermission().catch(() => {});
  }
}

// ── Init ──────────────────────────────────────────────────────────────────────
(function init() {
  load();
  checkDailyReset();
  syncSettingsUI();

  // Handle stale running state from previous session
  if (timer.running && timer.endTime) {
    if (Date.now() >= timer.endTime) {
      // Ended while away — mark stopped without auto-advancing
      timer.remainingMs = 0;
      timer.running     = false;
      timer.endTime     = null;
      save();
    } else {
      startTick();
    }
  }

  applyModeColors(timer.mode);

  // Sync mode tab states
  modeBtns.forEach(btn => {
    const active = btn.dataset.mode === timer.mode;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', active ? 'true' : 'false');
  });

  updateUI();
  maybeRequestNotifyPermission();
})();
