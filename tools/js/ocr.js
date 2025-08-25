const dropZone = document.getElementById('dropZone');
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const preview = document.getElementById('preview');
const output = document.getElementById('output');
const status = document.getElementById('status');
let currentImage = null;

// Check if Tesseract.js is loaded
window.addEventListener('load', async () => {
    if (typeof Tesseract === 'undefined') {
        status.textContent = 'Error: Tesseract.js failed to load. Please refresh the page.';
        status.classList.add('error');
    }
});

// Handle drag-and-drop
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => loadImage(event.target.result);
        reader.readAsDataURL(file);
    } else {
        status.textContent = 'Please drop a valid image file (PNG, JPEG, etc.).';
        status.classList.add('error');
    }
});

// Handle file upload
document.getElementById('imageUpload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => loadImage(event.target.result);
        reader.readAsDataURL(file);
    }
});

// Handle clipboard paste
document.addEventListener('paste', async (e) => {
    e.preventDefault();
    try {
        const items = e.clipboardData.items;
        for (const item of items) {
            if (item.type.startsWith('image/')) {
                const blob = item.getAsFile();
                const url = URL.createObjectURL(blob);
                loadImage(url);
                return;
            }
        }
        status.textContent = 'No image found in clipboard.';
        status.classList.add('error');
    } catch (err) {
        status.textContent = 'Error accessing clipboard: ' + err.message;
        status.classList.add('error');
    }
});

// Load image to canvas, preview, and process
async function loadImage(src) {
    currentImage = new Image();
    currentImage.crossOrigin = 'Anonymous';
    currentImage.onload = async () => {
        canvas.width = currentImage.width;
        canvas.height = currentImage.height;
        ctx.drawImage(currentImage, 0, 0);
        preview.src = src;
        preview.style.display = 'block';
        status.textContent = 'Image loaded. Processing...';
        status.classList.remove('error');
        status.classList.add('progress');
        output.value = '';

        // Automatically process the image with Tesseract.js
        try {
            if (typeof Tesseract === 'undefined') {
                throw new Error('Tesseract.js is not loaded. Please refresh the page.');
            }
            const { data: { text } } = await Tesseract.recognize(
                canvas,
                'eng',
                {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            status.textContent = `Recognizing text... ${Math.round(m.progress * 100)}%`;
                            status.classList.add('progress');
                        }
                    }
                }
            );
            output.value = text || 'No text detected.';
            status.textContent = 'Done processing.';
            status.classList.remove('progress');
        } catch (err) {
            status.textContent = 'Error during OCR: ' + err.message;
            status.classList.add('error');
        }
    };
    currentImage.onerror = () => {
        status.textContent = 'Failed to load image.';
        status.classList.add('error');
    };
    currentImage.src = src;
}