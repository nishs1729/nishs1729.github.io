// ---------- city options (timezone, label) ----------
const CITY_OPTIONS = [
  {tz:'Asia/Kolkata', label:'Kolkata'},
  {tz:'Asia/Kolkata', label:'Delhi'},
  {tz:'Asia/Kolkata', label:'Pune'},
  {tz:'Asia/Kolkata', label:'Bilaspur'},
  {tz:'Europe/London', label:'Bristol'},
  {tz:'America/Los_Angeles', label:'San Diego'},
  {tz:'Asia/Tokyo', label:'Tokyo'},
  {tz:'Asia/Tokyo', label:'Naha'},
  {tz:'Asia/Shanghai', label:'Shanghai'},
  {tz:'Asia/Singapore', label:'Singapore'},
  {tz:'Asia/Dubai', label:'Dubai'},
  {tz:'Europe/London', label:'London'},
  {tz:'Europe/Paris', label:'Paris'},
  {tz:'Europe/Berlin', label:'Berlin'},
  {tz:'Europe/Moscow', label:'Moscow'},
  {tz:'America/New_York', label:'New York'},
  {tz:'America/New_York', label:'Atlanta'},
  {tz:'America/Chicago', label:'Chicago'},
  {tz:'America/Denver', label:'Denver'},
  {tz:'America/Los_Angeles', label:'Los Angeles'},
  {tz:'America/Toronto', label:'Toronto'},
  {tz:'America/Sao_Paulo', label:'Sao Paulo'},
  {tz:'America/Mexico_City', label:'Mexico City'},
  {tz:'Pacific/Auckland', label:'Auckland'},
  {tz:'Australia/Sydney', label:'Sydney'},
  {tz:'Africa/Johannesburg', label:'Johannesburg'},
  {tz:'Africa/Cairo', label:'Cairo'}
];

// Weather code mapping (based on WMO codes from Open-Meteo docs)
const weatherCodes = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail'
};

async function fetchWeatherData(cityLabel, weatherDivId) {
  const weatherDiv = document.getElementById(weatherDivId);
  weatherDiv.innerHTML = 'Loading...';
  try {
    const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityLabel)}&count=1&language=en&format=json`);
    if (!geoResponse.ok) throw new Error('Geocoding failed');
    const geoData = await geoResponse.json();
    if (!geoData.results || geoData.results.length === 0) throw new Error('City not found');

    const { latitude, longitude } = geoData.results[0];

    const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`);
    if (!weatherResponse.ok) throw new Error('Weather fetch failed');
    const weatherData = await weatherResponse.json();

    const temp = weatherData.current.temperature_2m;
    const code = weatherData.current.weather_code;
    const condition = weatherCodes[code] || 'Unknown';

    weatherDiv.innerHTML = `<p>${temp}°C</p><p>${condition}</p>`;
  } catch (error) {
    weatherDiv.innerHTML = `<p>Weather: N/A (${error.message})</p>`;
  }
}

// globals
let cityCards = []; // {id, tz, label, el}
let baseDate = new Date();
let liveMode = true;
let timer = null;
let isDragging = false; let dragStartY = 0; let dragUid = null;

// populate select
const sel = document.getElementById('citySelect');
CITY_OPTIONS.forEach((c, i) => {
  const opt = document.createElement('option');
  opt.value = i; // index
  opt.textContent = `${c.label} — ${c.tz.split('/').shift() === c.tz ? c.tz : c.tz.split('/')[0]}`;
  sel.appendChild(opt);
});

sel.addEventListener('change', () => {
  const idx = Number(sel.value);
  const {tz,label} = CITY_OPTIONS[idx];
  addCity(tz,label);
});
document.getElementById('resetBtn').addEventListener('click', () => resetToCurrentTime());

// helper: safe id
function uidFrom(label){
  return 'c_' + label.replace(/[^a-z0-9]/gi,'').toLowerCase() + '_' + Math.random().toString(36).slice(2,7);
}

// convert a Date to a YYYY-MM-DDTHH:MM string representing that instant in given timezone
function formatForDatetimeLocal(date, tz){
  const fmt = new Intl.DateTimeFormat('sv-SE', { timeZone: tz, hour12: false,
    year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' });
  return fmt.format(date).replace(' ','T');
}

// convert a wall-time in timezone -> Date (UTC instant) using Intl trick described in the message
function wallTimeToUTC(year, month, day, hour, minute, tz){
  const ts = Date.UTC(year, month-1, day, hour, minute);
  const dt = new Date(ts);
  const f = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour12:false,
    year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' });
  const parts = f.formatToParts(dt);
  const y2 = Number(parts.find(p=>p.type==='year').value);
  const m2 = Number(parts.find(p=>p.type==='month').value);
  const d2 = Number(parts.find(p=>p.type==='day').value);
  const h2 = Number(parts.find(p=>p.type==='hour').value);
  const min2 = Number(parts.find(p=>p.type==='minute').value);
  const ts2 = Date.UTC(y2, m2-1, d2, h2, min2);
  const diff = ts - ts2;
  return new Date(ts + diff);
}

function addCity(tz, label){
  // allow same tz multiple times (e.g., New York and Atlanta) but prevent duplicate labels
  if (cityCards.find(c => c.label === label)) return;
  const uid = uidFrom(label);
  const el = document.createElement('div');
  const gidx = cityCards.length % 6;
  el.className = 'city-card g-' + gidx;
  el.innerHTML = `
    <div class="left">
      <div class="city-name">${label}</div>
      <div class="time-display" id="clock-${uid}">--:--</div>
      <div class="date-display" id="date-${uid}"></div>
    </div>
    <div class="weather-info" id="weather-${uid}">Loading weather...</div>
    <span class="close-btn" id="close-${uid}" title="Remove">×</span>
    <input type="datetime-local" id="time-${uid}">
  `;

  // attach events
  el.addEventListener('mousedown', e => startDrag(e, uid));
  el.addEventListener('touchstart', e => startDragTouch(e, uid), {passive:true});
  document.getElementById('cities').appendChild(el);
  cityCards.push({ id: uid, tz, label, el });

  // Add event listeners to time and date displays to open native picker
  const clockDisplay = document.getElementById('clock-' + uid);
  const dateDisplay = document.getElementById('date-' + uid);
  const input = document.getElementById('time-'+uid);

  const openPicker = (e) => {
    e.stopPropagation();
    try{ input.showPicker && input.showPicker(); }catch(err){}
    input.click();
  };

  clockDisplay.addEventListener('click', openPicker);
  dateDisplay.addEventListener('click', openPicker);

  const closeBtn = document.getElementById('close-'+uid);
  closeBtn.addEventListener('click', e => { e.stopPropagation(); removeCity(uid); });

  input.addEventListener('input', () => userChangedTime(uid));

  fetchWeatherData(label, `weather-${uid}`);
  updateTimes();
}

function removeCity(uid){
  const idx = cityCards.findIndex(c=>c.id===uid);
  if (idx>=0){ cityCards[idx].el.remove(); cityCards.splice(idx,1); }
}

function updateTimes(){
  cityCards.forEach(c => {
    const clock = document.getElementById('clock-'+c.id);
    const input = document.getElementById('time-'+c.id);
    const dateDisplay = document.getElementById('date-'+c.id); // Get date display element

    // display time
    const timeFmt = new Intl.DateTimeFormat('en-GB', { timeZone: c.tz, hour12:false, hour:'2-digit', minute:'2-digit' });
    const timeStr = timeFmt.format(baseDate);
    clock.textContent = timeStr;

    // display date
    const dateFmt = new Intl.DateTimeFormat('en-US', { timeZone: c.tz, month: 'short', day: 'numeric', year: 'numeric' });
    const dateStr = dateFmt.format(baseDate);
    dateDisplay.textContent = dateStr;

    // set hidden input to the corresponding local wall time
    input.value = formatForDatetimeLocal(baseDate, c.tz);
  });
}

function userChangedTime(uid){
  const c = cityCards.find(x=>x.id===uid);
  if(!c) return;
  const input = document.getElementById('time-'+uid);
  const val = input.value; if(!val) return;
  // parse YYYY-MM-DDTHH:MM
  const [datePart,timePart] = val.split('T');
  const [year,month,day] = datePart.split('-').map(Number);
  const [hour,minute] = timePart.split(':').map(Number);
  // convert wall time in c.tz -> UTC instant
  try{
    const newBase = wallTimeToUTC(year, month, day, hour, minute, c.tz);
    baseDate = newBase;
    liveMode = false;
    clearInterval(timer);
    updateTimes();
  }catch(err){
    console.error('Failed to convert wall time', err);
  }
}



function resetToCurrentTime(){ liveMode = true; baseDate = new Date(); updateTimes(); startTimer(); }
function startTimer(){ clearInterval(timer); if (liveMode){ timer = setInterval(()=>{ baseDate = new Date(); updateTimes(); }, 60000); } }

// drag to nudge time in 30-min steps
function startDrag(e, uid){
  isDragging = true; dragStartY = e.clientY || (e.touches && e.touches[0].clientY);
  dragUid = uid;
  document.onmouseup = stopDrag; document.onmousemove = doDrag;
  document.ontouchend = stopDrag; document.ontouchmove = doDragTouch;
}
function startDragTouch(e, uid){ startDrag(e, uid); }
function stopDrag(){ isDragging=false; dragUid=null; document.onmouseup=null; document.onmousemove=null; document.ontouchend=null; document.ontouchmove=null; }
function doDrag(e){ if(!isDragging) return; const y = e.clientY; handleDragDelta(y); }
function doDragTouch(e){ if(!isDragging) return; const y = e.touches[0].clientY; handleDragDelta(y); }