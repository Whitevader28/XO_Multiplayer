function resetBoard(turn) {
  turn.number = 0;
  cell.forEach((cell) => (cell.innerHTML = ""));
  cellData = [];
  cell.forEach((cell) => cell.addEventListener("click", onCellClickEvent));

  document.getElementById("winner").innerHTML = `It\'s <span id="currentTurn">${
    turn.number == 0 ? "X" : "O"
  }</span> turn`;
}

function waitResetInput() {
  cell.forEach((cell) => cell.removeEventListener("click", onCellClickEvent));
  document.addEventListener(
    "click",
    function () {
      socket.send(
        generateWebSocketPayload("gameReset", { sessionId: currentGame.id })
      );
    },
    { once: true }
  );
}

function setBoard(serverBoard) {
  board = serverBoard;
  for (let i = 0; i < board.length; ++i) {
    cell[i].innerHTML = serverBoard[i];
  }
}

const onCellClickEvent = function (e) {
  onCellClick(this, turn, score);
  e.stopPropagation();
};

function onCellClick(element, turn, score) {
  // assert we start from turn number 0, and X goes first
  // element is the table data the user clicked on

  // checking if the box is already taken
  if (element.innerHTML) return;

  const cellIndex = cell.findIndex((cell) => {
    return cell.id == element.id;
  });

  socket.send(
    generateWebSocketPayload("gameAction", {
      userId: getUserId(),
      position: cellIndex,
    })
  );
}

function setScore(score) {
  document.getElementById("scoreX").innerHTML = score.X;
  document.getElementById("score0").innerHTML = score.O;
}
