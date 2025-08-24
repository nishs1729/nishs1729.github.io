// -- Robust Pomodoro Timer (single-file)
// Principle: use absolute timestamps (endTime) so that even if JS is throttled or paused, the remaining time
// is computed from Date.now(). Persist state into localStorage so reloads resume.

const display = document.getElementById('display');
const minutesInput = document.getElementById('minutesInput');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const shortBtn = document.getElementById('shortBtn');
const longBtn = document.getElementById('longBtn');
const setNowBtn = document.getElementById('setNowBtn');
const autorestart = document.getElementById('autorestart');
const bell = document.getElementById('bellSound');

const STORAGE_KEY = 'pomodoro_state_v1';
let timerInterval = null;
let state = {
  running: false,
  endTime: null, // epoch ms
  remainingMs: 25 * 60 * 1000,
  durationMinutes: 25
};

function saveState(){
  try{localStorage.setItem(STORAGE_KEY, JSON.stringify(state));}catch(e){}
}
function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw) state = Object.assign(state, JSON.parse(raw));
  }catch(e){}
}

function formatMs(ms){
  if(ms < 0) ms = 0;
  const totalSec = Math.round(ms/1000);
  const mm = Math.floor(totalSec/60).toString().padStart(2,'0');
  const ss = (totalSec % 60).toString().padStart(2,'0');
  return `${mm}:${ss}`;
}

function updateDisplay(){
  let rem = state.remainingMs;
  if(state.running && state.endTime){
    rem = state.endTime - Date.now();
    state.remainingMs = Math.max(0, rem);
  }
  display.textContent = formatMs(state.remainingMs);
}

function tick(){
  updateDisplay();
  if(state.running && state.remainingMs <= 0){
    finishCycle();
  }
}

function start(){
  // if not started, set endTime
  if(!state.running){
    state.running = true;
    state.durationMinutes = Number(minutesInput.value) || 25;
    if(!state.endTime || state.remainingMs <= 0){
      state.remainingMs = state.durationMinutes * 60 * 1000;
      state.endTime = Date.now() + state.remainingMs;
    } else {
      state.endTime = Date.now() + state.remainingMs;
    }
    saveState();
  }
  if(timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(tick, 300);
  tick();
}

function pause(){
  if(state.running){
    // compute remaining by absolute time
    state.remainingMs = Math.max(0, state.endTime - Date.now());
    state.running = false;
    state.endTime = null;
    saveState();
  }
  if(timerInterval) clearInterval(timerInterval);
  timerInterval = null;
  updateDisplay();
}

function reset(){
  state.running = false;
  state.durationMinutes = Number(minutesInput.value) || 25;
  state.remainingMs = state.durationMinutes * 60 * 1000;
  state.endTime = null;
  saveState();
  if(timerInterval) clearInterval(timerInterval);
  timerInterval = null;
  updateDisplay();
}

function finishCycle(){
  state.running = false;
  state.endTime = null;
  state.remainingMs = 0;
  saveState();
  if(timerInterval){ clearInterval(timerInterval); timerInterval = null; }
  updateDisplay();
  notifyFinished();
  // auto restart if checked
  if(autorestart.checked){
    // short delay then restart
    setTimeout(()=>{
      state.durationMinutes = Number(minutesInput.value) || 25;
      state.remainingMs = state.durationMinutes * 60 * 1000;
      start();
    }, 800);
  }
}

function notifyFinished(){
  // vibration
  if('vibrate' in navigator) navigator.vibrate([200,80,200]);
  // sound
  try{ bell.currentTime = 0; bell.play().catch(()=>{}); }catch(e){}
  // notification
  if('Notification' in window){
    if(Notification.permission === 'granted'){
      const n = new Notification('Pomodoro finished', {body: 'Time is up!', silent: true});
      setTimeout(()=>n.close(), 8000);
    } else if(Notification.permission !== 'denied'){
      Notification.requestPermission().then(p => { if(p === 'granted'){ new Notification('Pomodoro finished', {body: 'Time is up!', silent:true}); } });
    }
  }
}

// UI wiring
startBtn.addEventListener('click', ()=>{ start(); });
pauseBtn.addEventListener('click', ()=>{ pause(); });
resetBtn.addEventListener('click', ()=>{ reset(); });
shortBtn.addEventListener('click', ()=>{ minutesInput.value = 5; reset(); });
longBtn.addEventListener('click', ()=>{ minutesInput.value = 15; reset(); });
setNowBtn.addEventListener('click', ()=>{ /* no-op but indicates current time */ reset(); });

minutesInput.addEventListener('change', ()=>{
  const v = Number(minutesInput.value) || 25;
  minutesInput.value = Math.max(1, Math.min(180, Math.floor(v)));
  state.durationMinutes = Number(minutesInput.value);
  if(!state.running){ state.remainingMs = state.durationMinutes * 60 * 1000; }
  saveState();
  updateDisplay();
});

// keep display correct when page becomes visible or hidden
document.addEventListener('visibilitychange', ()=>{ updateDisplay(); });

// save state before unload
window.addEventListener('beforeunload', ()=>{ saveState(); });

// Load saved state
(function init(){
  loadState();
  minutesInput.value = state.durationMinutes || 25;
  // If running and endTime exists, let it continue
  if(state.running && state.endTime){
    // If endTime is in the past, finish immediately
    if(Date.now() >= state.endTime){
      state.remainingMs = 0;
      state.running = false;
      state.endTime = null;
      saveState();
    } else {
      // resume interval
      if(timerInterval) clearInterval(timerInterval);
      timerInterval = setInterval(tick, 300);
    }
  }
  updateDisplay();
  // Ask for notification permission proactively (optional)
  if('Notification' in window && Notification.permission === 'default'){
    try{ Notification.requestPermission().then(()=>{}); }catch(e){}
  }
})();

// Optional nice-to-have: try the wake lock API to keep CPU running while timer is active (best-effort)
let wakeLock = null;
async function requestWakeLock(){
  try{
    if('wakeLock' in navigator && state.running){
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', ()=>{ wakeLock = null; });
    }
  }catch(e){ wakeLock = null; }
}
async function releaseWakeLock(){ if(wakeLock) try{ await wakeLock.release(); wakeLock = null;}catch(e){} }

// Manage wake lock around start/pause
startBtn.addEventListener('click', requestWakeLock);
pauseBtn.addEventListener('click', releaseWakeLock);
resetBtn.addEventListener('click', releaseWakeLock);

// Keep state consistent even if user edits the input while running: update endTime
minutesInput.addEventListener('input', ()=>{
  if(state.running && state.endTime){
    // recompute endTime to preserve elapsed fraction
    const elapsed = (state.durationMinutes * 60 * 1000) - state.remainingMs;
    const newDur = Number(minutesInput.value) || 25;
    state.durationMinutes = newDur;
    state.remainingMs = Math.max(0, newDur*60*1000 - elapsed);
    state.endTime = Date.now() + state.remainingMs;
    saveState();
  }
});
