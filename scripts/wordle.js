// scripts/wordle.js

const targetWord = 'OONTZ'.toUpperCase();
const maxAttempts = 6;
const wordLength = 5;

const gameGrid = document.getElementById('gameGrid');
const keyboard = document.getElementById('keyboard');
const message = document.getElementById('message');

let currentAttempt = 0;
let currentGuess = [];
let gameOver = false;

// Initialize the game grid
function initGameGrid() {
    for (let i = 0; i < maxAttempts; i++) {
        const row = document.createElement('div');
        row.classList.add('guess-row');
        for (let j = 0; j < wordLength; j++) {
            const box = document.createElement('div');
            box.classList.add('letter-box');
            row.appendChild(box);
        }
        gameGrid.appendChild(row);
    }
}

// Initialize the keyboard
function initKeyboard() {
    const keys = [
        'Q','W','E','R','T','Y','U','I','O','P',
        'A','S','D','F','G','H','J','K','L',
        'Z','X','C','V','B','N','M','-',
        'ENTER','BACKSPACE'
    ];

    keys.forEach(key => {
        const button = document.createElement('button');
        button.textContent = key;
        button.id = `key-${key}`;
        button.classList.add('key');
        if (key === 'ENTER' || key === 'BACKSPACE') {
            button.classList.add('wide');
        }
        button.addEventListener('click', () => handleKeyPress(key));
        keyboard.appendChild(button);
    });
}

// Handle key presses
function handleKeyPress(key) {
    if (gameOver) return;

    if (key === 'ENTER') {
        submitGuess();
    } else if (key === 'BACKSPACE') {
        removeLetter();
    } else {
        addLetter(key);
    }
}

// Add a letter to the current guess
function addLetter(letter) {
    if (currentGuess.length < wordLength) {
        currentGuess.push(letter);
        updateGrid();
    }
}

// Remove the last letter from the current guess
function removeLetter() {
    if (currentGuess.length > 0) {
        currentGuess.pop();
        updateGrid();
    }
}

// Update the game grid with the current guess
function updateGrid() {
    const row = gameGrid.children[currentAttempt];
    for (let i = 0; i < wordLength; i++) {
        const box = row.children[i];
        box.textContent = currentGuess[i] || '';
    }
}

// Submit the current guess
function submitGuess() {
    if (currentGuess.length !== wordLength) {
        showMessage('Not enough letters!', 'red');
        return;
    }

    const guess = currentGuess.join('');
    if (!validateGuess(guess)) {
        showMessage('Invalid guess!', 'red');
        return;
    }

    evaluateGuess(guess);
    currentAttempt++;
    currentGuess = [];

    if (guess === targetWord) {
        showMessage('Congratulations! You guessed correctly!', 'green');
        gameOver = true;
    } else if (currentAttempt === maxAttempts) {
        showMessage(`Game Over! The word was "${targetWord}".`, 'red');
        gameOver = true;
    }
}

// Simple validation (you can enhance this with a dictionary check)
function validateGuess(guess) {
    // Allow letters and hyphen only
    return /^[A-Z\-]{10}$/.test(guess);
}

// Evaluate the guess and provide feedback
function evaluateGuess(guess) {
    const row = gameGrid.children[currentAttempt];
    const targetLetters = targetWord.split('');
    const guessLetters = guess.split('');

    // Create arrays to track letter statuses
    const letterStatus = Array(wordLength).fill('absent');

    // First pass: Check for correct letters
    for (let i = 0; i < wordLength; i++) {
        if (guessLetters[i] === targetLetters[i]) {
            letterStatus[i] = 'correct';
            targetLetters[i] = null; // Remove matched letters
            guessLetters[i] = null;
        }
    }

    // Second pass: Check for present letters
    for (let i = 0; i < wordLength; i++) {
        if (guessLetters[i] && targetLetters.includes(guessLetters[i])) {
            letterStatus[i] = 'present';
            targetLetters[targetLetters.indexOf(guessLetters[i])] = null;
        }
    }

    // Update the grid and keyboard
    for (let i = 0; i < wordLength; i++) {
        const box = row.children[i];
        box.classList.add(letterStatus[i]);
        if (guessLetters[i] !== null) { // Only update if not already correct
            updateKeyboard(guessLetters[i], letterStatus[i]);
        }
    }
}

// Update the on-screen keyboard based on letter status
function updateKeyboard(letter, status) {
    if (letter === '-') return; // Ignore hyphen for keyboard updates

    const key = document.getElementById(`key-${letter}`);
    if (key) {
        // Assign the highest priority status
        if (status === 'correct') {
            key.classList.remove('present', 'absent');
            key.classList.add('correct');
        } else if (status === 'present' && !key.classList.contains('correct')) {
            key.classList.remove('absent');
            key.classList.add('present');
        } else if (status === 'absent' && !key.classList.contains('correct') && !key.classList.contains('present')) {
            key.classList.add('absent');
        }
    }
}

// Show a message to the user
function showMessage(text, color) {
    message.textContent = text;
    message.style.color = color;
    message.style.display = 'block';
}

// Initialize the game on page load
function initWordle() {
    initGameGrid();
    initKeyboard();

    // Listen for physical keyboard input
    document.addEventListener('keydown', (e) => {
        if (gameOver) return;
        const key = e.key.toUpperCase();
        if (key === 'ENTER') {
            handleKeyPress('ENTER');
        } else if (key === 'BACKSPACE') {
            handleKeyPress('BACKSPACE');
        } else if (/^[A-Z\-]$/.test(key)) {
            handleKeyPress(key);
        }
    });
}

initWordle();
