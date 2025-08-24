// ---------- QR GENERATION ----------
const qrText = document.getElementById('qrText');
const qrSize = document.getElementById('qrSize');
const qrMargin = document.getElementById('qrMargin');
const qrLevel = document.getElementById('qrLevel');
const qrFg = document.getElementById('qrFg');
const qrBg = document.getElementById('qrBg');
const qrPreview = document.getElementById('qrPreview');
const btnGenerate = document.getElementById('btnGenerate');
const btnClearGen = document.getElementById('btnClearGen');
const btnDownloadPNG = document.getElementById('btnDownloadPNG');
const btnDownloadSVG = document.getElementById('btnDownloadSVG');

const qrImageInput = document.getElementById('qrImageInput');
const embedImage = document.getElementById('embedImage');
const qrLogoScale = document.getElementById('qrLogoScale');
const qrLogoBgTransparent = document.getElementById('qrLogoBgTransparent');
const qrLogoScaleValue = document.getElementById('qrLogoScaleValue');

const qrBgImageInput = document.getElementById('qrBgImageInput');
const enableBgImage = document.getElementById('enableBgImage');

const dotScale = document.getElementById('dotScale');
const dotScaleValue = document.getElementById('dotScaleValue');

const qrTitle = document.getElementById('qrTitle');

let lastWasSVG = false;
let embeddedImageDataURL = null;
let qrcodeInstance = null; // To store the EasyQRCodeJS instance

function clearPreview() {
  qrPreview.innerHTML = '<span class="muted">Your QR will appear here</span>';
  btnDownloadPNG.disabled = true;
  btnDownloadSVG.disabled = true;
  
  embeddedImageDataURL = null;
  backgroundImageDataURL = null;
  if (qrcodeInstance) {
    qrcodeInstance.clear(); // Clear the QR code
  }
}

clearPreview();

function loadImageAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

async function makeQR() {
  console.log('makeQR called');
  const text = qrText.value.trim();
  console.log('QR Text:', text);
  if (!text) {
    console.log('QR Text is empty, clearing preview.');
    clearPreview();
    return;
  }

  // Clear the qrPreview element completely before generating
  qrPreview.innerHTML = '';

  const options = {
    text: text,
    width: parseInt(qrSize.value, 10) || 320,
    height: parseInt(qrSize.value, 10) || 320,
    colorDark: qrFg.value || '#000000',
    colorLight: qrBg.value || '#ffffff',
    correctLevel: QRCode.CorrectLevel[qrLevel.value] || QRCode.CorrectLevel.M,
    drawer: 'svg', // Ensure SVG output
    margin: parseInt(qrMargin.value, 10) || 0,
    title: qrTitle.value.trim() || undefined,
    dotScale: parseFloat(dotScale.value) || 1
  };
  console.log('Generating QR with options:', options);

  // Handle image embedding
  if (embedImage.checked && qrImageInput.files.length > 0) {
    try {
      embeddedImageDataURL = await loadImageAsDataURL(qrImageInput.files[0]);
      options.logo = embeddedImageDataURL;
      const logoScale = parseFloat(qrLogoScale.value) || 0.2;
      options.logoWidth = options.width * logoScale;
      options.logoHeight = options.height * logoScale;
      options.logoBackgroundTransparent = qrLogoBgTransparent.checked;
      console.log('Image embedded:', options.logo);
    } catch (e) {
      console.error('Error loading image for embedding:', e);
      alert('Error loading image for embedding. Check console for details.');
      embeddedImageDataURL = null;
    }
  } else {
    embeddedImageDataURL = null;
  }

  // Handle background image
  if (enableBgImage.checked && qrBgImageInput.files.length > 0) {
    try {
      backgroundImageDataURL = await loadImageAsDataURL(qrBgImageInput.files[0]);
      options.backgroundImage = backgroundImageDataURL;
      options.autoColor = enableBgImage.checked;
      console.log('Background image set:', options.backgroundImage);
    } catch (e) {
      console.error('Error loading background image:', e);
      alert('Error loading background image. Check console for details.');
      backgroundImageDataURL = null;
    }
  } else {
    backgroundImageDataURL = null;
  }

  try {
    // Create a new EasyQRCodeJS instance
    qrcodeInstance = new QRCode(qrPreview, options);
    console.log('EasyQRCodeJS instance created:', qrcodeInstance);

    // Enable downloads after a tick so DOM updates
    setTimeout(() => {
      btnDownloadPNG.disabled = false;
      btnDownloadSVG.disabled = false;
      btnCopyDataURL.disabled = false;
      lastWasSVG = true; // current output is SVG
      console.log('Download buttons enabled.');
    }, 50);
  } catch (e) {
    console.error('Error generating QR code:', e);
    alert('Error generating QR code. Check console for details.');
    clearPreview();
  }
}

btnGenerate.addEventListener('click', () => {
  console.log('Generate button clicked');
  makeQR();
});
[qrSize, qrMargin, qrLevel, qrFg, qrBg, embedImage, qrLogoScale, qrLogoBgTransparent, qrBgImageInput, enableBgImage, dotScale, qrTitle].forEach(el => el.addEventListener('change', () => {
  console.log('Input changed:', el.id);
  makeQR();
}));
qrText.addEventListener('input', () => {
  console.log('QR Text input changed');
  // live generate but debounced
  clearTimeout(qrText._t);
  qrText._t = setTimeout(makeQR, 350);
});
qrImageInput.addEventListener('change', () => {
  console.log('QR Image input changed');
  makeQR();
});
qrBgImageInput.addEventListener('change', () => {
  console.log('QR Background Image input changed');
  makeQR();
});
qrTitle.addEventListener('input', () => {
  console.log('QR Title input changed');
  clearTimeout(qrTitle._t);
  qrTitle._t = setTimeout(makeQR, 350);
});

btnClearGen.addEventListener('click', () => {
  console.log('Clear button clicked');
  qrText.value = '';
  qrImageInput.value = '';
  qrBgImageInput.value = '';
  embedImage.checked = false;
  qrLogoBgTransparent.checked = true;
  enableBgImage.checked = false;
  qrTitle.value = '';
  clearPreview();
});

function download(filename, dataURL) {
  const a = document.createElement('a');
  a.href = dataURL;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

btnDownloadSVG.addEventListener('click', () => {
  console.log('Download SVG button clicked');
  const svg = qrPreview.querySelector('svg'); // Get the SVG element directly
  if (!svg) { console.log('No SVG found to download.'); return; }
  const serializer = new XMLSerializer();
  const source = serializer.serializeToString(svg);
  const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  download('qr-code.svg', url);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
});

btnDownloadPNG.addEventListener('click', async () => {
  console.log('Download PNG button clicked');
  const svg = qrPreview.querySelector('svg');
  if (!svg) { console.log('No SVG found to convert to PNG.'); return; }
  const xml = new XMLSerializer().serializeToString(svg);
  const svg64 = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = svg64;
  await img.decode().catch(() => { console.error('Image decode failed.'); });
  const canvas = document.createElement('canvas');
  const size = parseInt(qrSize.value, 10) || 320;
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = qrBg.value || '#ffffff';
  ctx.fillRect(0, 0, size, size);
  ctx.drawImage(img, 0, 0, size, size);
  download('qr-code.png', canvas.toDataURL('image/png'));
});

function updateSliderValue(slider, valueSpan) {
  valueSpan.textContent = parseFloat(slider.value).toFixed(2);
}

qrLogoScale.addEventListener('input', () => updateSliderValue(qrLogoScale, qrLogoScaleValue));
dotScale.addEventListener('input', () => updateSliderValue(dotScale, dotScaleValue));

// Initialize slider values
updateSliderValue(qrLogoScale, qrLogoScaleValue);
updateSliderValue(dotScale, dotScaleValue);


// ---------- QR SCANNING ----------
const video = document.getElementById('video');
const hiddenCanvas = document.getElementById('hiddenCanvas');
const resultText = document.getElementById('resultText');
const btnCopy = document.getElementById('btnCopy');
const btnOpen = document.getElementById('btnOpen');
const fileInput = document.getElementById('fileInput');
const btnStart = document.getElementById('btnStart');
const btnStop = document.getElementById('btnStop');
const btnTorch = document.getElementById('btnTorch');
const cameraSelect = document.getElementById('cameraSelect');
const statusBadge = document.getElementById('statusBadge');

let stream = null; let rafId = null; let track = null; let torchOn = false;

function setStatus(text) { statusBadge.textContent = text; }

function isLikelyURL(s) {
  try {
    const u = new URL(s.startsWith('http') ? s : 'https://' + s);
    return true;
  } catch { return false; }
}

function showResult(text) {
  resultText.textContent = text || '—';
  btnCopy.disabled = !text;
  if (text && isLikelyURL(text.trim())) {
    btnOpen.style.display = '';
    const href = text.startsWith('http') ? text.trim() : 'https://' + text.trim();
    btnOpen.href = href;
  } else {
    btnOpen.style.display = 'none';
  }
}

async function listCameras() {
  cameraSelect.innerHTML = '';
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cams = devices.filter(d => d.kind === 'videoinput');
    cams.forEach((c, idx) => {
      const opt = document.createElement('option');
      opt.value = c.deviceId; opt.textContent = c.label || `Camera ${idx+1}`;
      cameraSelect.appendChild(opt);
    });
    if (cams.length === 0) {
      const opt = document.createElement('option');
      opt.textContent = 'No camera found';
      cameraSelect.appendChild(opt);
    }
  } catch (e) {
    const opt = document.createElement('option');
    opt.textContent = 'Permission needed';
    cameraSelect.appendChild(opt);
  }
}

async function startCamera() {
  try {
    if (stream) await stopCamera();
    setStatus('Starting…');
    const constraints = {
      audio: false,
      video: cameraSelect.value ? { deviceId: { exact: cameraSelect.value } } : { facingMode: { ideal: 'environment' } }
    };
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream; await video.play();
    track = stream.getVideoTracks()[0];
    btnStop.disabled = false; btnStart.disabled = true; btnTorch.disabled = false;
    setStatus('Scanning…');
    scanLoop();
  } catch (e) {
    setStatus('Camera blocked');
    alert('Could not start camera. Check permissions or try https / a different browser.');
  }
}

async function stopCamera() {
  if (rafId) cancelAnimationFrame(rafId);
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null; track = null;
  }
  btnStop.disabled = true; btnStart.disabled = false; btnTorch.disabled = true; torchOn = false;
  setStatus('Idle');
}

async function toggleTorch() {
  if (!track) return;
  const caps = track.getCapabilities?.();
  if (caps && caps.torch) {
    torchOn = !torchOn;
    await track.applyConstraints({ advanced: [{ torch: torchOn }] });
    btnTorch.textContent = torchOn ? 'Torch Off' : 'Toggle Torch';
  } else {
    alert('Torch not supported on this device/camera.');
  }
}

function scanLoop() {
  if (!stream) return;
  const w = video.videoWidth, h = video.videoHeight;
  if (!w || !h) { rafId = requestAnimationFrame(scanLoop); return; }
  hiddenCanvas.width = w; hiddenCanvas.height = h;
  const ctx = hiddenCanvas.getContext('2d');
  ctx.drawImage(video, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h);
  const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });
  if (code && code.data) {
    showResult(code.data);
  }
  rafId = requestAnimationFrame(scanLoop);
}

btnStart.addEventListener('click', async () => {
  console.log('Start Camera button clicked');
  await startCamera();
  await listCameras(); // refresh labels after permission granted
});
btnStop.addEventListener('click', () => {
  console.log('Stop Camera button clicked');
  stopCamera();
});
btnTorch.addEventListener('click', () => {
  console.log('Toggle Torch button clicked');
  toggleTorch();
});

cameraSelect.addEventListener('change', () => {
  console.log('Camera select changed');
  if (stream) startCamera();
});

// File/image scanning
fileInput.addEventListener('change', async (e) => {
  console.log('File input changed');
  const file = e.target.files?.[0];
  if (!file) { console.log('No file selected.'); return; }
  const img = new Image();
  img.src = URL.createObjectURL(file);
  await img.decode().catch(()=>{ console.error('Image decode failed.'); });
  const canvas = hiddenCanvas; const ctx = canvas.getContext('2d');
  canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const code = jsQR(imageData.data, imageData.width, imageData.height);
  if (code && code.data) {
    showResult(code.data);
    setStatus('Scanned from image');
  } else {
    showResult('No QR found in image.');
    setStatus('Idle');
  }
  URL.revokeObjectURL(img.src);
});

btnCopy.addEventListener('click', async () => {
  console.log('Copy button clicked');
  try {
    await navigator.clipboard.writeText(resultText.textContent);
    btnCopy.textContent = 'Copied!';
    setTimeout(() => (btnCopy.textContent = 'Copy'), 1000);
  } catch (e) {
    alert('Clipboard blocked. Manually copy the Data URL from devtools.');
    console.error('Clipboard write failed:', e);
  }
});

// Initialize camera list (will show blank labels until permission granted)
listCameras();
