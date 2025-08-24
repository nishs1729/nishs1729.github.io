document.addEventListener('DOMContentLoaded', () => {
  const carousels = document.querySelectorAll('.carousel');

  carousels.forEach(carousel => {
    const inner = carousel.querySelector('.carousel__inner');
    const items = Array.from(inner.children);
    let activeIndex = 0;
    let autoPlayInterval; // Variable to store the interval ID
    const autoPlayDuration = 5000; // 5 seconds autoplay duration
    const transitionDuration = 1000; // 1 second transition duration

    inner.style.transitionDuration = `${transitionDuration}ms`;
    items.forEach(item => {
      item.style.transitionDuration = `${transitionDuration}ms`;
    });

    function updateCarousel() {
      items.forEach((item, i) => {
        item.classList.remove('active', 'prev', 'next');

        if (i === activeIndex) {
          item.classList.add('active');
        } else if (i === (activeIndex - 1 + items.length) % items.length) {
          item.classList.add('prev');
        } else if (i === (activeIndex + 1) % items.length) {
          item.classList.add('next');
        }
      });
    }

    function setActiveIndex(index) {
      activeIndex = (index + items.length) % items.length;
      updateCarousel();
      stopAutoPlay(); // Stop autoplay on manual interaction
      startAutoPlay(); // Restart autoplay
    }

    function startAutoPlay() {
      autoPlayInterval = setInterval(() => {
        setActiveIndex(activeIndex + 1);
      }, autoPlayDuration);
    }

    function stopAutoPlay() {
      clearInterval(autoPlayInterval);
    }

    items.forEach((item, i) => {
      item.addEventListener('click', () => {
        if (i !== activeIndex) {
          setActiveIndex(i);
        }
      });
    });

    // Initialize
    setActiveIndex(0);
    startAutoPlay(); // Start autoplay after initialization
  });
});

