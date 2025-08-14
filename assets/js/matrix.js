const canvas = document.getElementById('matrixCanvas');
  const ctx = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()_+-=[]{};:,.<>/?';
  const fontSize = 16;
  const columns = canvas.width / fontSize;

  const drops = [];
  for (let i = 0; i < columns; i++) {
    drops[i] = 1;
  }

  let matrixTextColor;
  let matrixBgColor;

  function updateThemeColors() {
    const container = document.querySelector('.matrix-container');
    if (container) {
      matrixTextColor = getComputedStyle(container).getPropertyValue('--matrix-text-color').trim();
      matrixBgColor = getComputedStyle(container).getPropertyValue('--matrix-bg-color').trim();
    }
  }

  function drawMatrix() {
    ctx.fillStyle = matrixBgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = matrixTextColor;
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
      const text = characters.charAt(Math.floor(Math.random() * characters.length));
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  let animationInterval;

  function startMatrixAnimation() {
    updateThemeColors(); // Update colors on animation start/theme change
    // Check if dark theme is active
    if (document.documentElement.getAttribute('data-theme') === 'dark') {
      if (!animationInterval) {
        animationInterval = setInterval(drawMatrix, 33);
      }
    } else {
      // If not dark theme, stop animation and clear canvas
      stopMatrixAnimation();
    }
  }

  function stopMatrixAnimation() {
    if (animationInterval) {
      clearInterval(animationInterval);
      animationInterval = null;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  // Initial check and start
  startMatrixAnimation();

  // Listen for theme changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
        startMatrixAnimation();
      }
    });
  });

  observer.observe(document.documentElement, { attributes: true });

  // Handle window resize
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Reinitialize drops array for new column count
    const newColumns = canvas.width / fontSize;
    drops.length = 0; // Clear existing drops
    for (let i = 0; i < newColumns; i++) {
      drops[i] = 1;
    }
  });

