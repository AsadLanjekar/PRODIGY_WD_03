const cells = [];
const board = document.getElementById("gameBoard");
const statusText = document.getElementById("statusText");
const restartBtn = document.getElementById("restartBtn");
const modeSelect = document.getElementById("modeSelect");
const difficultySelect = document.getElementById("difficultySelect");

let currentPlayer = "X";
let gameActive = true;
let gameState = ["", "", "", "", "", "", "", "", ""];
let gameMode = "single";    // "single" for Single Player; "two" for Two Player
let difficulty = "easy";    // Options: "easy", "medium", "hard"

const winConditions = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

function init() {
  // Build the board
  for (let i = 0; i < 9; i++) {
    const div = document.createElement("div");
    div.classList.add("cell");
    div.setAttribute("data-index", i);
    div.addEventListener("click", handleCellClick);
    board.appendChild(div);
    cells.push(div);
  }

  statusText.textContent = "X's Turn";
  restartBtn.addEventListener("click", restartGame);
  modeSelect.addEventListener("change", () => {
    gameMode = modeSelect.value;
    restartGame();
  });
  difficultySelect.addEventListener("change", () => {
    difficulty = difficultySelect.value;
  });
}

// Updated click handler: in single player, only X (human) makes a move.
function handleCellClick(e) {
  const cell = e.target;
  const index = Number(cell.getAttribute("data-index"));

  if (gameState[index] !== "" || !gameActive) return;

  if (gameMode === "single") {
    // Only allow human move when currentPlayer is X
    if (currentPlayer !== "X") return;
    makeMove(index, "X");
    checkResult();
    if (gameActive) {
      // Switch to computer turn
      currentPlayer = "O";
      statusText.textContent = "O's Turn";
      setTimeout(() => {
        computerMove();
        checkResult();
        if (gameActive) {
          currentPlayer = "X";
          statusText.textContent = "X's Turn";
        }
      }, 500);
    }
  } else { // Two player mode
    makeMove(index, currentPlayer);
    checkResult();
    if (gameActive) {
      currentPlayer = currentPlayer === "X" ? "O" : "X";
      statusText.textContent = `${currentPlayer}'s Turn`;
    }
  }
}

function makeMove(index, player) {
  gameState[index] = player;
  cells[index].textContent = player;
}

function checkResult() {
  for (let condition of winConditions) {
    const [a, b, c] = condition;
    if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
      statusText.textContent = `${gameState[a]} Wins! 🎉`;
      gameActive = false;
      highlightWin([a, b, c]);
      return;
    }
  }

  if (!gameState.includes("")) {
    statusText.textContent = "It's a Draw! 🤝";
    gameActive = false;
  }
}

function highlightWin(indices) {
  indices.forEach(i => {
    cells[i].style.backgroundColor = "#005577";
    cells[i].style.boxShadow = "0 0 10px #00eaff";
  });
}

function restartGame() {
  gameState = ["", "", "", "", "", "", "", "", ""];
  gameActive = true;
  currentPlayer = "X";
  statusText.textContent = "X's Turn";

  cells.forEach(cell => {
    cell.textContent = "";
    cell.style.backgroundColor = "#222";
    cell.style.boxShadow = "none";
  });
}

function computerMove() {
  let move;
  if (difficulty === "easy") {
    move = randomMove();
  } else if (difficulty === "medium") {
    move = mediumMove();
  } else {
    move = bestMove();
  }
  if (move !== undefined) {
    makeMove(move, "O");
  }
}

function randomMove() {
  const empty = gameState.map((v, i) => (v === "" ? i : null)).filter(i => i !== null);
  return empty[Math.floor(Math.random() * empty.length)];
}

function mediumMove() {
  // Try to win
  for (let [a, b, c] of winConditions) {
    let line = [gameState[a], gameState[b], gameState[c]];
    if (line.filter(v => v === "O").length === 2 && line.includes("")) {
      return [a, b, c][line.indexOf("")];
    }
  }
  // Try to block
  for (let [a, b, c] of winConditions) {
    let line = [gameState[a], gameState[b], gameState[c]];
    if (line.filter(v => v === "X").length === 2 && line.includes("")) {
      return [a, b, c][line.indexOf("")];
    }
  }
  return randomMove();
}

function bestMove() {
  let bestScore = -Infinity;
  let move;
  for (let i = 0; i < 9; i++) {
    if (gameState[i] === "") {
      gameState[i] = "O";
      let score = minimax(gameState, 0, false);
      gameState[i] = "";
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(state, depth, isMaximizing) {
  const winner = getWinner(state);
  if (winner !== null) {
    if (winner === "O") return 10 - depth;
    if (winner === "X") return depth - 10;
    return 0;
  }

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (state[i] === "") {
        state[i] = "O";
        best = Math.max(best, minimax(state, depth + 1, false));
        state[i] = "";
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (state[i] === "") {
        state[i] = "X";
        best = Math.min(best, minimax(state, depth + 1, true));
        state[i] = "";
      }
    }
    return best;
  }
}

function getWinner(state) {
  for (let [a, b, c] of winConditions) {
    if (state[a] && state[a] === state[b] && state[a] === state[c]) {
      return state[a];
    }
  }
  return state.includes("") ? null : "draw";
}

init();
