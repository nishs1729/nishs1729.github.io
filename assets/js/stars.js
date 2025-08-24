  function createStar() {
    const container = document.querySelector('.stars-container');
    const star = document.createElement('div');
    star.classList.add('star');

    const x = Math.random() * 100;
    const y = Math.random() * 100;
    star.style.left = x + 'vw';
    star.style.top = y + 'vh';
    
    const duration = Math.random() * 2 + 1; // Stars will have a random animation duration between 1 and 3 seconds
    star.style.animationDuration = duration + 's';

    container.appendChild(star);

    // Remove the star after 20 seconds
    setTimeout(() => {
      star.remove();
    }, 20000); // 20000 milliseconds = 20 seconds
  }

  // Continuously create stars every 200 milliseconds
  setInterval(createStar, 200);