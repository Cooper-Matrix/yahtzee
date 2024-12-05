// Variables to track game state
let dice = [0, 0, 0, 0, 0];
let rollsLeft = 3;
let currentPlayer = "player1";
let heldDice = [false, false, false, false, false];
let gameOver = false;

// Initialize the scoreboards for both players
let scores = {
  player1: initializeScoreboard(),
  player2: initializeScoreboard(),
};

// DOM Elements
const diceButtons = Array.from(document.getElementsByClassName("dice"));
const rollsLeftDisplay = document.getElementById("rolls-left");
const scoreboard = document.getElementById("scoreboard");
const currentPlayerDisplay = document.getElementById("current-player");
const gameMessage = document.getElementById("game-message");

// Initialize an empty scoreboard for both players
function initializeScoreboard() {
  return {
    "Chance": 0,
    "Ones": 0,
    "Twos": 0,
    "Threes": 0,
    "Fours": 0,
    "Fives": 0,
    "Sixes": 0,
    "Three of a Kind": 0,
    "Four of a Kind": 0,
    "Full House": 0,
    "Small Straight": 0,
    "Large Straight": 0,
    "Yahtzee": 0,
    "Total": 0, // Added total field to calculate the sum of the score
  };
}

// Roll Dice
document.getElementById("roll-btn").addEventListener("click", function () {
  if (rollsLeft > 0 && !gameOver) {
    dice = dice.map((value, index) => {
      return heldDice[index] ? value : rollDie();
    });
    rollsLeft--;
    updateUI();
  }
});

// Toggle dice hold
diceButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    if (rollsLeft < 3 && !gameOver) {
      heldDice[index] = !heldDice[index];
      button.classList.toggle("held");
    }
  });
});

// Function to roll a single die
function rollDie() {
  return Math.floor(Math.random() * 6) + 1;
}

// Function to update the UI
function updateUI() {
  diceButtons.forEach((button, index) => {
    button.textContent = dice[index];
    if (heldDice[index]) {
      button.classList.add("held");
    } else {
      button.classList.remove("held");
    }
  });
  rollsLeftDisplay.textContent = rollsLeft;
  currentPlayerDisplay.textContent = currentPlayer === "player1" ? "Player 1" : "Player 2";
  renderScoreboard();
}

// Render the scoreboard dynamically
function renderScoreboard() {
  scoreboard.innerHTML = ""; // Clear previous rows
  const scoringCategories = calculateScores();

  // Render the scoreboard for both players
  ["player1", "player2"].forEach((player) => {
    const row = document.createElement("tr");

    // Player Category Header
    const playerHeader = document.createElement("td");
    playerHeader.textContent = `${player === "player1" ? "Player 1" : "Player 2"}`;
    playerHeader.colSpan = 2;
    row.appendChild(playerHeader);

    scoreboard.appendChild(row);

    // Render each scoring category row for both players
    for (const category in scoringCategories) {
      const row = document.createElement("tr");

      // Category Cell
      const categoryCell = document.createElement("td");
      categoryCell.textContent = category;

      // Score cells for Player 1 and Player 2
      const scoreCellPlayer1 = document.createElement("td");
      const scoreCellPlayer2 = document.createElement("td");

      scoreCellPlayer1.textContent = scores.player1[category] === 0 ? scoringCategories[category] : scores.player1[category];
      scoreCellPlayer2.textContent = scores.player2[category] === 0 ? scoringCategories[category] : scores.player2[category];

      // Make the category clickable for scoring
      if (currentPlayer === "player1" && scores.player1[category] === 0 && scoringCategories[category] >= 0) {
        scoreCellPlayer1.classList.add("clickable");
        scoreCellPlayer1.addEventListener("click", () => {
          // If the player scores points
          if (scoringCategories[category] > 0) {
            scores.player1[category] = scoringCategories[category];
          } else {
            // If the player rolls zero points
            scores.player1[category] = 0;
          }
          resetRound();
          switchPlayer();
          checkGameOver();
        });
        categoryCell.style.backgroundColor = "lightgreen"; // Highlight with green if category is available to select
      } else if (currentPlayer === "player2" && scores.player2[category] === 0 && scoringCategories[category] >= 0) {
        scoreCellPlayer2.classList.add("clickable");
        scoreCellPlayer2.addEventListener("click", () => {
          // If the player scores points
          if (scoringCategories[category] > 0) {
            scores.player2[category] = scoringCategories[category];
          } else {
            // If the player rolls zero points
            scores.player2[category] = 0;
          }
          resetRound();
          switchPlayer();
          checkGameOver();
        });
        categoryCell.style.backgroundColor = "lightgreen"; // Highlight with green if category is available to select
      }

      // Append category and score cells to the row
      row.appendChild(categoryCell);
      row.appendChild(scoreCellPlayer1);
      row.appendChild(scoreCellPlayer2);

      // Append the row to the scoreboard
      scoreboard.appendChild(row);
    }

    // Render the total row
    const totalRow = document.createElement("tr");
    const totalLabel = document.createElement("td");
    totalLabel.textContent = "Total Score";

    const player1Total = Object.values(scores.player1).reduce((sum, score) => sum + score, 0);
    const player2Total = Object.values(scores.player2).reduce((sum, score) => sum + score, 0);

    const totalPlayer1 = document.createElement("td");
    const totalPlayer2 = document.createElement("td");

    totalPlayer1.textContent = player1Total;
    totalPlayer2.textContent = player2Total;

    totalRow.appendChild(totalLabel);
    totalRow.appendChild(totalPlayer1);
    totalRow.appendChild(totalPlayer2);

    scoreboard.appendChild(totalRow);
  });
}

// Calculate scores based on the current dice
function calculateScores() {
  const diceCount = Array(6).fill(0);
  dice.forEach((die) => diceCount[die - 1]++);

  return {
    "Chance": dice.reduce((a, b) => a + b, 0),
    "Ones": diceCount[0] * 1,
    "Twos": diceCount[1] * 2,
    "Threes": diceCount[2] * 3,
    "Fours": diceCount[3] * 4,
    "Fives": diceCount[4] * 5,
    "Sixes": diceCount[5] * 6,
    "Three of a Kind": diceCount.some((count) => count >= 3) ? dice.reduce((a, b) => a + b, 0) : 0,
    "Four of a Kind": diceCount.some((count) => count >= 4) ? dice.reduce((a, b) => a + b, 0) : 0,
    "Full House": diceCount.includes(3) && diceCount.includes(2) ? 25 : 0,
    "Small Straight": isSmallStraight(diceCount) ? 30 : 0,
    "Large Straight": isLargeStraight(diceCount) ? 40 : 0,
    "Yahtzee": diceCount.includes(5) ? 50 : 0,
  };
}

function isSmallStraight(diceCount) {
  return [0, 1, 1, 1, 1].every((count, index) => diceCount[index] >= count) ||
         [1, 1, 1, 1, 0].every((count, index) => diceCount[index] >= count);
}

function isLargeStraight(diceCount) {
  return [0, 1, 1, 1, 1, 1].every((count, index) => diceCount[index] >= count);
}

// Reset the round for the next player's turn
function resetRound() {
  rollsLeft = 3;
  heldDice = [false, false, false, false, false];
  updateUI();
}

// Switch players after a round is completed
function switchPlayer() {
  currentPlayer = currentPlayer === "player1" ? "player2" : "player1";
  updateUI();
}

// Check if the game is over
function checkGameOver() {
  const player1ScoreFilled = Object.values(scores.player1).every((score) => score !== 0);
  const player2ScoreFilled = Object.values(scores.player2).every((score) => score !== 0);

  if (player1ScoreFilled && player2ScoreFilled) {
    gameOver = true;
    gameMessage.textContent = "Game Over!";
  }
}
