document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('score');
    const gameOverScreen = document.getElementById('game-over-screen');
    const finalScoreDisplay = document.getElementById('final-score');
    const restartButton = document.getElementById('restart-button');

    const CANVAS_WIDTH = canvas.width;
    const CANVAS_HEIGHT = canvas.height;

    // Load the runner image
    const runnerImage = new Image();
    runnerImage.src = 'runner.gif'; // Make sure runner.gif is in the same directory!
    let runnerLoaded = false;

    // This callback runs once the image has finished loading
    runnerImage.onload = () => {
        runnerLoaded = true;
        // Adjust player dimensions based on the image size.
        // DECREASE THE '0.3' VALUE TO MAKE THE GIF SMALLER.
        // INCREASE THE '0.3' VALUE TO MAKE THE GIF LARGER.
        player.width = runnerImage.width * 0.3; // Example: now it's 50% of original width
        player.height = runnerImage.height * 0.3; // Example: now it's 50% of original height

        // Re-adjust player's y position to sit on the ground
        // 10 pixels is a small buffer from the very bottom edge of the canvas
        player.y = CANVAS_HEIGHT - player.height - 10;
    };

    // Game variables
    let player = {
        x: 50,
        y: CANVAS_HEIGHT - 60, // Initial y, will be adjusted once image loads
        width: 30,           // Initial width, will be adjusted by image.onload
        height: 50,          // Initial height, will be adjusted by image.onload
        dy: 0,               // vertical velocity (dy = delta y, change in y)
        gravity: 0.5,        // how fast the player falls
        isJumping: false     // true if player is in the air
    };

    let obstacles = [];
    let gameSpeed = 5; // Initial speed at which obstacles move
    let score = 0;
    let gameOver = false;
    let frame = 0; // Counter for game frames, useful for timing events

    // --- Game Functions ---

    // Draws the player (the runner GIF) on the canvas
    function drawPlayer() {
        if (runnerLoaded) {
            // Draw the loaded image at the player's position and dimensions
            ctx.drawImage(runnerImage, player.x, player.y, player.width, player.height);
        } else {
            // If the image hasn't loaded yet, draw a placeholder (e.g., a lightblue rectangle)
            // This is good for debugging or if the image fails to load
            ctx.fillStyle = 'lightblue';
            ctx.fillRect(player.x, player.y, player.width, player.height);
        }
    }

    // Creates a new obstacle and adds it to the obstacles array
    function createObstacle() {
        const obstacleWidth = 20 + Math.random() * 30; // Random width for variety
        const obstacleHeight = 20 + Math.random() * 40; // Random height for variety
        obstacles.push({
            x: CANVAS_WIDTH, // Start obstacle at the right edge of the canvas
            y: CANVAS_HEIGHT - obstacleHeight, // Position on the ground
            width: obstacleWidth,
            height: obstacleHeight,
            color: 'red' // Obstacles are red rectangles
        });
    }

    // Draws all current obstacles on the canvas
    function drawObstacles() {
        obstacles.forEach(obstacle => {
            ctx.fillStyle = obstacle.color;
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });
    }

    // The main game loop, called repeatedly
    function updateGame() {
        if (gameOver) return; // Stop the loop if game is over

        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); // Clear the entire canvas for redrawing

        frame++; // Increment frame counter
        score++; // Increment score (you might want to tie this to distance run)
        scoreDisplay.textContent = `Score: ${Math.floor(score / 10)}`; // Update score display (divided by 10 to slow down score gain)

        // Apply gravity to player's vertical velocity
        player.dy += player.gravity;
        player.y += player.dy; // Update player's vertical position

        // Prevent player from falling through the floor
        if (player.y + player.height > CANVAS_HEIGHT - 10) { // Check if player is below ground level (-10 for buffer)
            player.y = CANVAS_HEIGHT - player.height - 10; // Snap to ground
            player.dy = 0; // Stop vertical movement
            player.isJumping = false; // Player is no longer jumping
        }

        // Update obstacle positions (move them left)
        obstacles.forEach(obstacle => {
            obstacle.x -= gameSpeed;
        });

        // Remove obstacles that have moved off-screen to the left
        obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);

        // Periodically create new obstacles
        // 'frame % 150 === 0' means every 150 frames, a new obstacle is created
        if (frame % 150 === 0) {
            createObstacle();
        }

        // Collision detection: Check if player overlaps with any obstacle
        obstacles.forEach(obstacle => {
            if (
                player.x < obstacle.x + obstacle.width &&     // Player's left edge is to the left of obstacle's right edge
                player.x + player.width > obstacle.x &&       // Player's right edge is to the right of obstacle's left edge
                player.y < obstacle.y + obstacle.height &&    // Player's top edge is above obstacle's bottom edge
                player.y + player.height > obstacle.y         // Player's bottom edge is below obstacle's top edge
            ) {
                endGame(); // If collision detected, end the game
            }
        });

        drawPlayer();     // Draw the player in its new position
        drawObstacles();  // Draw all obstacles in their new positions

        requestAnimationFrame(updateGame); // Request the next frame to continue the loop
    }

    // Makes the player jump
    function jump() {
        if (!player.isJumping) { // Only jump if not already in the air
            player.dy = -16; // Apply an upward force (negative dy)
            player.isJumping = true; // Set jumping flag to true
        }
    }

    // Handles game over state
    function endGame() {
        gameOver = true; // Set game over flag
        finalScoreDisplay.textContent = Math.floor(score / 10); // Display final score
        gameOverScreen.classList.remove('hidden'); // Show the game over screen
    }

    // Resets the game to its initial state
    function resetGame() {
        player.y = CANVAS_HEIGHT - player.height - 10; // Reset player position
        player.dy = 0;
        player.isJumping = false;
        obstacles = []; // Clear all obstacles
        score = 0;
        gameOver = false; // Reset game over flag
        frame = 0;
        gameOverScreen.classList.add('hidden'); // Hide game over screen
        updateGame(); // Start the game loop again
    }

    // --- Event Listeners ---

    // Listen for keyboard presses (Space or Up Arrow for jumping)
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            jump();
        }
    });

    // Listen for touch events on the canvas (for mobile devices)
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent default browser actions like scrolling
        jump();
    });

    // Listen for click on the restart button
    restartButton.addEventListener('click', resetGame);

    // Initial setup when the page loads
    createObstacle(); // Create the very first obstacle
    updateGame(); // Start the game loop
});
