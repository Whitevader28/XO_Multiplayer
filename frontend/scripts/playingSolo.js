// Get the 9 cells into an array so it is easier to work with
const cell = [
  document.getElementById("11"),
  document.getElementById("12"),
  document.getElementById("13"),
  document.getElementById("21"),
  document.getElementById("22"),
  document.getElementById("23"),
  document.getElementById("31"),
  document.getElementById("32"),
  document.getElementById("33"),
];

// Get the element for updating the current turn
// X starts the game with turn 0
// We use cell data to be able to pass a copy of the board around
const score = { scoreX: 0, score0: 0 };
let cellData = [];
const autoPlay = { on: false };
const easyOptions = { center: 0.75, corner: 0.75, slopiness: 0.75 };
const mediumOptions = { center: 0.75, corner: 0.25, slopiness: 0.5 };
const hardOptions = { center: 0.75, corner: 0.25, slopiness: 0.25 };
const insaneOptions = { center: 0.75, corner: 0.5, slopiness: 0.1 };
const option = { option: mediumOptions }; // the actual option

// All except turn ar treated as global variables
const turn = { number: 0 };

function flipAutoPlayBtn(turn) {
  autoPlay.on = !autoPlay.on;
  document.getElementById("autoPlay-btn").innerHTML = autoPlay.on
    ? "ON"
    : "OFF";

  // if it is computer's turn (O turn)
  if (autoPlay.on && turn.number % 2 == 1) {
    computerMove(turn);
  }
}

function flipBtn(element) {
  if (element.className == "unselected-btn option-btn") {
    const selected = document.getElementsByClassName("selected-btn");
    for (select of selected) {
      if (select.className == "selected-btn option-btn")
        select.className = "unselected-btn option-btn";
    }
    element.className = "selected-btn option-btn";

    switch (element.id) {
      case "easy-btn":
        option.option = easyOptions;
        break;
      case "medium-btn":
        option.option = mediumOptions;
        break;
      case "hard-btn":
        option.option = hardOptions;
        break;
      case "insane-btn":
        option.option = insaneOptions;
        break;
      default:
        option.option = mediumOptions;
        break;
    }
  } else if (element.className == "unselected-btn") {
    element.className = "selected-btn";
  } else if (element.className == "selected-btn") {
    element.className = "unselected-btn";
  }
}

function resetBoard(turn) {
  turn.number = 0;
  cell.forEach((cell) => (cell.innerHTML = ""));
  cellData = [];
  cell.forEach((cell) => cell.addEventListener("click", onCellClickEvent));

  document.getElementById("winner").innerHTML =
    'It\'s <span id="currentTurn">X</span> turn';
}

function checkWinner(turn, cellData, draw = false) {
  // return false for not yet decided
  // return true for the current turn winner
  if (turn < 3) return false;

  const current = turn % 2 == 0 ? "X" : "O";

  // check rows
  if (
    cellData[0] == current &&
    cellData[0] == cellData[1] &&
    cellData[0] == cellData[2]
  ) {
    // draw first row
    return true;
  }

  if (
    cellData[3] == current &&
    cellData[3] == cellData[4] &&
    cellData[3] == cellData[5]
  ) {
    // draw second row
    return true;
  }

  if (
    cellData[6] == current &&
    cellData[6] == cellData[7] &&
    cellData[6] == cellData[8]
  ) {
    // draw third row
    return true;
  }

  // check columns
  if (
    cellData[0] == current &&
    cellData[0] == cellData[3] &&
    cellData[0] == cellData[6]
  ) {
    //1 row
    return true;
  }
  if (
    cellData[1] == current &&
    cellData[1] == cellData[4] &&
    cellData[1] == cellData[7]
  ) {
    //2 row
    return true;
  }

  if (
    cellData[2] == current &&
    cellData[2] == cellData[5] &&
    cellData[2] == cellData[8]
  ) {
    // 3 row
    return true;
  }

  // check diagonals
  if (
    cellData[0] == current &&
    cellData[0] == cellData[4] &&
    cellData[0] == cellData[8]
  ) {
    // main
    return true;
  }

  if (
    cellData[2] == current &&
    cellData[2] == cellData[4] &&
    cellData[2] == cellData[6]
  ) {
    // second diag
    return true;
  }

  return false;
}

// medium by default
function getBestMove(turn, options = mediumOptions) {
  var best = -1;
  let possibleMoves = [];
  let corners = [];

  // playstyle parameters in range [0, 1]
  let x = Math.random() <= options.center; // center bias (comes first)
  let y = Math.random() <= options.corner; // corners bias
  let z = Math.random() <= options.slopiness; // sloppines (not blocking a player winning move)

  for (let i = 0; i < cell.length; ++i) {
    // // dumb mode: gets last available position
    // if (!cellData[i]) {
    //   best = i;
    // }

    if (cellData[i] == null) {
      cellData[i] = "O";
      const isWinnerPC = checkWinner(turn, cellData);
      if (isWinnerPC) {
        // if we return the winning move we don't care for defensive moves
        return i;
      }

      cellData[i] = "X";
      const isWinnerPlayer = checkWinner(turn + 1, cellData);
      if (isWinnerPlayer) {
        // if computer is not sloppy it blocks
        if (z == 0) {
          best = i;
        }
      }
      cellData[i] = null;

      // conquer the center x% of the time
      if (best == -1 && i == 4 && x) {
        best = i;
      } else {
        possibleMoves.push(i);
        switch (i) {
          case 0:
          case 2:
          case 6:
          case 8:
            corners.push(i);
            break;
          default:
            break;
        }
      }
    }
  }

  // conquer corners y% of the time if there are any
  if (best == -1 && y && corners.length) {
    best = corners[Math.floor(Math.random(corners.length))];
  } else if (best == -1) {
    best = possibleMoves[Math.floor(Math.random(possibleMoves.length))];
  }

  return best;
}

function waitResetInput(turn) {
  cell.forEach((cell) => cell.removeEventListener("click", onCellClickEvent));
  document.addEventListener(
    "click",
    function (e) {
      resetBoard(turn);
    },
    { once: true }
  );
}

function setScore(winner) {
  if (winner == "X") {
    score.scoreX++;
    document.getElementById("scoreX").innerHTML = score.scoreX;
  } else {
    score.score0++;
    document.getElementById("score0").innerHTML = score.score0;
  }
}

function verifyStopConditions(turn, current) {
  const isWinner = checkWinner(turn.number, cellData, true);
  if (isWinner) {
    document.getElementById("winner").innerHTML =
      "Winner is " + current + ". Click to restart";

    // Set score for the winner (the current turn)
    setScore(current);

    // Freeze the board and wait for reset click
    waitResetInput(turn);
    return 1;
  }
  if (turn.number >= 8) {
    document.getElementById("winner").innerHTML =
      "It's a draw :(( Click to restart";
    waitResetInput(turn);
    return 1;
  }

  return 0;
}

function computerMove(turn) {
  const poz = getBestMove(turn.number, option.option);
  cell[poz].innerHTML = "O";
  cellData[poz] = "O";
  if (verifyStopConditions(turn, "O")) {
    return;
  }
  turn.number++;
  currentTurn.innerHTML = "O";
}

const onCellClickEvent = function (e) {
  onCellClick(this, turn, autoPlay, score);
  e.stopPropagation();
};

function onCellClick(element, turn, autoPlay, score) {
  // assert we start from turn number 0, and X goes first
  // element is the table data the user clicked on

  // checking if the box is already taken
  if (element.innerHTML) return;

  const current = turn.number % 2 == 0 ? "X" : "O";
  const other = turn.number % 2 != 0 ? "X" : "O";
  const currentTurn = document.getElementById("currentTurn");

  element.innerHTML = current;
  const cellPoz = cell.findIndex((elem) => elem == element);
  cellData[cellPoz] = current;

  if (verifyStopConditions(turn, current)) {
    return;
  }

  turn.number++;
  currentTurn.innerHTML = other;

  if (autoPlay.on) {
    //fake thinking

    // setTimeout((e) => {
    //   computerMove(turn);
    //   console.log("foo");
    // }, 300);
    computerMove(turn);
  }
}

function beginGame() {
  resetBoard(turn);

  // Manage buttons
  document
    .getElementById("autoPlay-btn")
    .addEventListener("click", function (e) {
      flipAutoPlayBtn(turn);
    });

  const buttons = document.getElementsByClassName("unselected-btn");

  for (let button of buttons) {
    button.addEventListener("click", function (e) {
      flipBtn(this);
    });
  }

  // There is only one selected button by default (the default difficulty option)
  document
    .getElementsByClassName("selected-btn")[0]
    .addEventListener("click", function (e) {
      flipBtn(this);
    });
}

beginGame();

// ---------- start testing api -------------------
const url = "http://localhost:3000/";

function updateTitle() {
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(respose.status);
      } else {
        return response.text();
      }
    })
    .then((text) => {
      document.getElementById("title").innerHTML = text;
      console.log(text);
    })
    .catch((error) => {
      document.getElementById("title").innerHTML = error;
    });
}

function testParams() {
  const data = { playerXid: "123" };
  fetch(url + "createSession", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.text();
    })
    .then((text) => {
      document.getElementById("title").innerHTML = text;
      console.log(text);
    });
}

function createGame() {}

function findGame() {}

// document.addEventListener("click", updateTitle);
// updateTitle();

testParams();
