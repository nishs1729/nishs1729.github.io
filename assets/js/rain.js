function createRaindrop() {
    const container = document.querySelector('.rain-container');
    const raindrop = document.createElement('div');
    raindrop.classList.add('rain');

    const x = Math.random() * 100;
    const y = Math.random() * 100;
    raindrop.style.left = x + 'vw';
    raindrop.style.top = y + 'vh';

    container.appendChild(raindrop);

    // Remove the raindrop after its animation completes (3 seconds as per _rain.scss)
    setTimeout(() => {
        raindrop.remove();
    }, 3000); // 3000 milliseconds = 3 seconds
}

// Continuously create raindrops every 200 milliseconds
setInterval(createRaindrop, 200);