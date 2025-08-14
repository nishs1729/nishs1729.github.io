document.addEventListener('DOMContentLoaded', () => {
  const plainCarousels = document.querySelectorAll('.plain-carousel-container');

  plainCarousels.forEach(carousel => {
    const slides = carousel.querySelectorAll('.plain-carousel-slide');
    let currentSlide = 0;
    let autoPlayInterval; // Variable to store the interval ID
    const autoPlayDuration = 5000; // 5 seconds

    // Initialize: set the first slide as active
    if (slides.length > 0) {
      slides[currentSlide].classList.add('active');
    }

    const showSlide = (index) => {
      slides[currentSlide].classList.remove('active');
      currentSlide = (index + slides.length) % slides.length;
      slides[currentSlide].classList.add('active');
    };

    const startAutoPlay = () => {
      autoPlayInterval = setInterval(() => {
        showSlide(currentSlide + 1);
      }, autoPlayDuration);
    };

    const stopAutoPlay = () => {
      clearInterval(autoPlayInterval);
    };

    // Start autoplay when the carousel loads
    startAutoPlay();

    carousel.addEventListener('click', (event) => {
      stopAutoPlay(); // Stop autoplay on manual interaction
      const carouselWidth = carousel.offsetWidth;
      const clickX = event.clientX - carousel.getBoundingClientRect().left;

      if (clickX < carouselWidth / 2) {
        // Click on left half, go to previous slide
        showSlide(currentSlide - 1);
      } else {
        // Click on right half, go to next slide
        showSlide(currentSlide + 1);
      }
      startAutoPlay(); // Restart autoplay after manual interaction
    });
  });
});