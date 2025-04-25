const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector(".score");
const highScoreElement = document.querySelector(".high-score");
const controls = document.querySelectorAll(".controls i");
const startGameOverlay = document.getElementById("start-game-overlay");
const gameOverOverlay = document.getElementById("game-over-overlay");
const pauseOverlay = document.getElementById("pause-overlay");
const finalScoreElement = document.querySelector(".final-score");
const startButton = document.querySelector(".start-button");
const restartButton = document.querySelector(".restart-button");

let gameOver = false;
let isPaused = false;
let gameStarted = false;
let foodX, foodY;
let snakeX, snakeY;
let velocityX, velocityY;
let snakeBody = [];
let setIntervalId;
let score = 0;
let currentDifficulty = "Medium";
let speed = 150;

let highScore = localStorage.getItem("high-score") || 0;
highScoreElement.innerText = `High Score: ${highScore}`;

const updateFoodPosition = () => {
    foodX = Math.floor(Math.random() * 30) + 1;
    foodY = Math.floor(Math.random() * 30) + 1;
};

const handleGameOver = () => {
    clearInterval(setIntervalId);
    gameOver = true;
    gameStarted = false;
    isPaused = false;
    finalScoreElement.innerText = score;
    gameOverOverlay.style.display = "flex";
    pauseOverlay.style.display = "none";
};

const togglePause = () => {
    if (!gameStarted || gameOver) return;

    isPaused = !isPaused;
    if (isPaused) {
        clearInterval(setIntervalId);
        pauseOverlay.style.display = "flex";
    } else {
        pauseOverlay.style.display = "none";
        setIntervalId = setInterval(initGame, speed);
    }
};


const changeDirection = e => {
    if (isPaused) return; // Ignore direction changes if paused

    let newVelocityX = velocityX;
    let newVelocityY = velocityY;
    const key = e.key || e.target.dataset?.key;

    if ((key === "ArrowUp" || key === "w") && velocityY !== 1) {
        newVelocityX = 0;
        newVelocityY = -1;
    } else if ((key === "ArrowDown" || key === "s") && velocityY !== -1) {
        newVelocityX = 0;
        newVelocityY = 1;
    } else if ((key === "ArrowLeft" || key === "a") && velocityX !== 1) {
        newVelocityX = -1;
        newVelocityY = 0;
    } else if ((key === "ArrowRight" || key === "d") && velocityX !== 1) {
        newVelocityX = 1;
        newVelocityY = 0;
    }

    // Prevent immediate reversal only if the snake has more than one segment
    if (snakeBody.length <= 1 || (newVelocityX !== -velocityX || newVelocityY !== -velocityY)) {
         velocityX = newVelocityX;
         velocityY = newVelocityY;
    }
};

const initGame = () => {
    if (gameOver || isPaused) return;

    let html = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;

    if (snakeX === foodX && snakeY === foodY) {
        updateFoodPosition();
        snakeBody.push([foodY, foodX]);
        score++;
        highScore = score >= highScore ? score : highScore;
        localStorage.setItem("high-score", highScore);
        scoreElement.innerText = `Score: ${score}`;
        highScoreElement.innerText = `High Score: ${highScore}`;
    }

     // Shift snake body forward
     for (let i = snakeBody.length - 1; i > 0; i--) {
        snakeBody[i] = snakeBody[i - 1];
    }

    // Update head position based on current position, not just velocity
    if (snakeBody.length > 0) {
         snakeBody[0] = [snakeY, snakeX];
    }

    // Update snake head's actual coordinates
    snakeX += velocityX;
    snakeY += velocityY;

    if (snakeX <= 0 || snakeX > 30 || snakeY <= 0 || snakeY > 30) {
        return handleGameOver();
    }

    // Render snake body and check for self-collision
    for (let i = 0; i < snakeBody.length; i++) {
        html += `<div class="body" style="grid-area: ${snakeBody[i][0]} / ${snakeBody[i][1]}"></div>`;
         // Check collision starting from the 4th segment if head hits body
        if (i > 0 && snakeX === snakeBody[i][1] && snakeY === snakeBody[i][0]) {
             if (velocityX !== 0 || velocityY !== 0) {
                 return handleGameOver();
             }
        }
    }
    // Render head separately
     html += `<div class="head" style="grid-area: ${snakeY} / ${snakeX}"></div>`;

    playBoard.innerHTML = html;
};


const setupInitialState = () => {
     gameOver = false;
     isPaused = false;
     gameStarted = false;
     score = 0;
     snakeX = 15;
     snakeY = 15;
     velocityX = 0; // Start stationary until first move
     velocityY = 0;
     snakeBody = [ [snakeY, snakeX-1], [snakeY, snakeX-2] ]; // Body starts behind head
     scoreElement.innerText = `Score: ${score}`;
     highScoreElement.innerText = `High Score: ${highScore}`; // Update high score display initially
     gameOverOverlay.style.display = "none";
     pauseOverlay.style.display = "none";
     updateFoodPosition();
     clearInterval(setIntervalId);

     // Initial render without starting the interval
     let initialHtml = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;
     initialHtml += `<div class="head" style="grid-area: ${snakeY} / ${snakeX}"></div>`;
     snakeBody.forEach(segment => {
        initialHtml += `<div class="body" style="grid-area: ${segment[0]} / ${segment[1]}"></div>`;
     });
     playBoard.innerHTML = initialHtml;
}


const beginGameplay = () => {
     if(gameStarted) return; // Prevent starting multiple times

     setupInitialState(); // Reset positions and score etc.
     startGameOverlay.style.display = "none"; // Hide start overlay
     gameStarted = true;
     isPaused = false;

     // Set initial movement direction (e.g., right)
     velocityX = 1;
     velocityY = 0;

     clearInterval(setIntervalId); // Clear just in case
     setIntervalId = setInterval(initGame, speed);

     // Add gameplay event listeners only after game starts
     document.removeEventListener("keydown", handleKeyPress); // Remove potential duplicate listener
     document.addEventListener("keydown", handleKeyPress);
     controls.forEach(button => {
          button.removeEventListener("click", changeDirection); // Remove potential duplicate listener
          button.addEventListener("click", changeDirection);
     });
}

const handleKeyPress = (e) => {
    if (e.key.toLowerCase() === 'p') {
        togglePause();
    } else if (e.key.toLowerCase() === 'r') {
        if(isPaused) togglePause(); // Only resume if paused
    } else {
        // Handle direction change only if game is active and not paused
        if (gameStarted && !isPaused) {
             changeDirection(e);
        }
    }
};

// Setup initial listeners and state
setupInitialState();
startGameOverlay.style.display = "flex"; // Show start overlay initially

startButton.addEventListener("click", beginGameplay);
restartButton.addEventListener("click", beginGameplay); // Restart button also starts a new game

// Add global key listener for pause/resume even before game starts
document.addEventListener("keydown", handleKeyPress);