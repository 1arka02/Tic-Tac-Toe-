document.addEventListener("DOMContentLoaded", () => {
    const gridContainer = document.getElementById('grid');
    const turnIndicator = document.getElementById('turn-indicator');
    const resetButton = document.getElementById('reset-btn');
    const resetScoresButton = document.getElementById('reset-scores-btn');
    const modal = document.getElementById('modal');
    const confirmResetButton = document.getElementById('confirm-reset');
    const cancelResetButton = document.getElementById('cancel-reset');
    const boardSizeSelector = document.getElementById('board-size');
    const player1ScoreElement = document.getElementById('player1-score');
    const player2ScoreElement = document.getElementById('player2-score');
    const player1NameInput = document.getElementById('player1-name');
    const player2NameInput = document.getElementById('player2-name');
    const changeNamesButton = document.getElementById('change-names-btn');
    const soloModeCheckbox = document.getElementById('solo-mode');

    let boardSize = 3;
    let currentPlayer = 'X';
    let board;
    let gameActive = true;
    let soloMode = false;

    let player1Name = localStorage.getItem('player1Name') || 'Player 1';
    let player2Name = localStorage.getItem('player2Name') || 'Player 2';
    let player1Score = parseInt(localStorage.getItem('player1Score')) || 0;
    let player2Score = parseInt(localStorage.getItem('player2Score')) || 0;

    function updateLeaderboard() {
        player1ScoreElement.textContent = `${player1Name}: ${player1Score}`;
        player2ScoreElement.textContent = `${player2Name}: ${player2Score}`;
        if (player1Score > player2Score) {
            player1ScoreElement.classList.add('leading');
            player2ScoreElement.classList.remove('leading');
        } else if (player2Score > player1Score) {
            player2ScoreElement.classList.add('leading');
            player1ScoreElement.classList.remove('leading');
        } else {
            player1ScoreElement.classList.remove('leading');
            player2ScoreElement.classList.remove('leading');
        }
    }

    function createBoard(size) {
        board = Array(size).fill(null).map(() => Array(size).fill(''));
        gridContainer.innerHTML = '';
        gridContainer.style.gridTemplateColumns = `repeat(${size}, 50px)`;
        gridContainer.style.gridTemplateRows = `repeat(${size}, 50px)`;
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const cell = document.createElement('div');
                cell.dataset.row = i;
                cell.dataset.col = j;
                cell.addEventListener('click', handleCellClick);
                gridContainer.appendChild(cell);
            }
        }
    }

    function handleCellClick(event) {
        if (!gameActive) return;
        const row = event.target.dataset.row;
        const col = event.target.dataset.col;
        if (board[row][col] !== '') return;
        board[row][col] = currentPlayer;
        event.target.textContent = currentPlayer;
        if (checkWin()) {
            turnIndicator.textContent = `${currentPlayer === 'X' ? player1Name : player2Name} wins!`;
            if (currentPlayer === 'X') {
                player1Score++;
                localStorage.setItem('player1Score', player1Score);
            } else {
                player2Score++;
                localStorage.setItem('player2Score', player2Score);
            }
            updateLeaderboard();
            gameActive = false;
            setTimeout(resetBoard, 5000);
        } else if (checkTie()) {
            turnIndicator.textContent = 'It\'s a tie!';
            gameActive = false;
            setTimeout(resetBoard, 5000);
        } else {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            turnIndicator.textContent = `${currentPlayer === 'X' ? player1Name : player2Name}'s turn`;
            if (soloMode && currentPlayer === 'O') {
                makeComputerMove();
            }
        }
    }

    function checkWin() {
        for (let i = 0; i < boardSize; i++) {
            if (board[i].every(cell => cell === currentPlayer) ||
                board.every(row => row[i] === currentPlayer)) {
                return true;
            }
        }
        if (board.every((row, idx) => row[idx] === currentPlayer) ||
            board.every((row, idx) => row[boardSize - idx - 1] === currentPlayer)) {
            return true;
        }
        return false;
    }

    function checkTie() {
        return board.flat().every(cell => cell !== '');
    }

    function resetBoard() {
        createBoard(boardSize);
        currentPlayer = 'X';
        turnIndicator.textContent = `${player1Name}'s turn`;
        gameActive = true;
    }

    function resetScores() {
        player1Score = 0;
        player2Score = 0;
        localStorage.setItem('player1Score', player1Score);
        localStorage.setItem('player2Score', player2Score);
        updateLeaderboard();
    }

    function makeComputerMove() {
        if (!gameActive) return;
        const emptyCells = [];
        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                if (board[i][j] === '') {
                    emptyCells.push({ row: i, col: j });
                }
            }
        }
        if (emptyCells.length === 0) return;
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        const { row, col } = emptyCells[randomIndex];
        board[row][col] = 'O';
        const cell = gridContainer.querySelector(`[data-row='${row}'][data-col='${col}']`);
        cell.textContent = 'O';
        if (checkWin()) {
            turnIndicator.textContent = `${player2Name} wins!`;
            player2Score++;
            localStorage.setItem('player2Score', player2Score);
            updateLeaderboard();
            gameActive = false;
            setTimeout(resetBoard, 5000);
        } else if (checkTie()) {
            turnIndicator.textContent = 'It\'s a tie!';
            gameActive = false;
            setTimeout(resetBoard, 5000);
        } else {
            currentPlayer = 'X';
            turnIndicator.textContent = `${player1Name}'s turn`;
        }
    }

    resetButton.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    confirmResetButton.addEventListener('click', () => {
        modal.style.display = 'none';
        resetBoard();
    });

    cancelResetButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    resetScoresButton.addEventListener('click', resetScores);

    boardSizeSelector.addEventListener('change', (event) => {
        boardSize = parseInt(event.target.value);
        resetBoard();
    });

    changeNamesButton.addEventListener('click', () => {
        player1Name = player1NameInput.value || 'Player 1';
        player2Name = player2NameInput.value || 'Player 2';
        localStorage.setItem('player1Name', player1Name);
        localStorage.setItem('player2Name', player2Name);
        updateLeaderboard();
        resetBoard();
    });

    soloModeCheckbox.addEventListener('change', (event) => {
        soloMode = event.target.checked;
        resetBoard();
    });

    player1NameInput.value = player1Name;
    player2NameInput.value = player2Name;

    updateLeaderboard();
    resetBoard();
});
