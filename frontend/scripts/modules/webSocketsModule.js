const wsURL = "ws://localhost:8080";

// Game initialization
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
let board = ["", "", "", "", "", "", "", "", ""];
const score = { scoreX: 0, score0: 0 };
let cellData = [];
const turn = { number: 0 };
const currentGame = {};

function connect() {
  const socket = new WebSocket(wsURL);

  socket.onopen = () => {
    document.getElementById("connectionError").innerHTML = "";
    document.getElementById("connectionMessage").innerHTML = "";

    socket.send(generateWebSocketPayload("connect", { userId: getUserId() }));
  };

  socket.onmessage = (event) => {
    const message = event.data;
    console.log(message);
    console.log(event);
    const parsedMessage = JSON.parse(message);

    switch (parsedMessage.event) {
      case "roomCreated":
        handleRoomCreatedResponse(parsedMessage.data.session.id);
        break;
      case "roomJoined":
        handleRoomJoinedResponse(parsedMessage);
        break;
      case "roomDeleted":
        handleDeletedRoomResponse(parsedMessage);
        break;
      case "gameActioned":
        handleGameActioned(parsedMessage);
        break;
      case "gameFinished":
        handleGameFinished(parsedMessage);
        break;
      case "gameReseted":
        handleGameReseted(parsedMessage);
        break;
      case "gameDraw":
        handleGameDraw(parsedMessage);
        break;
      case "restoreInfo":
        handleRestoreInfo(parsedMessage);
        break;
      case "error":
        handleErrorResponse(parsedMessage);
        break;

      default:
        console.log("Unkown event: ", event);
    }
  };

  socket.onclose = () => {
    handleWebSocketClose();
  };

  return socket;
}

function handleGameDraw(response) {
  document.getElementById("winner").innerHTML =
    "It's a draw :(( Click to restart";
  waitResetInput();
}

function handleGameFinished(response) {
  document.getElementById("winner").innerHTML =
    "Winner is " + response.data.winner + ". Click to restart";
  waitResetInput();
  setScore(response.data.score);
}

function handleGameReseted(response) {
  resetBoard(turn);
}

function handleErrorResponse(response) {
  console.log(response);
  alert(response.data.message);
}

function handleWebSocketClose() {
  // This will also try reconnecting in the backend
  window.location.reload(true);
}

function handleDeletedRoomResponse(response) {
  window.location.hash = "#menu";
  alert(response.data.message);
  document.getElementById("roomId").innerHTML =
    " (you are not connected to a room yet)";
  document.getElementById("createdRoomId").innerHTML = "";
}

function handleRoomCreatedResponse(id) {
  document.getElementById("createdRoomId").innerHTML = `Roomd id: ${id}`;
}

function handleRoomJoinedResponse(response) {
  window.location.hash = "#game";
  document.getElementById(
    "roomId"
  ).innerHTML = ` (room id: ${response.data.session.id})`;

  currentGame.id = response.data.session.id;
  setScore(response.data.session.score);
  resetBoard(turn);

  if (response.data.session.winner) {
    console.log("winner is set");
    waitResetInput(turn);
  }
}

function handleLeaveRoomEvent() {
  socket.send(generateWebSocketPayload("leaveRoom", { userId: getUserId() }));
}

function handleRestoreInfo(response) {
  turn.number = response.data.session.turn === "X" ? 0 : 1;
  if (response.data.session.winner === "draw") {
    document.getElementById("winner").innerHTML =
      "It's a draw :(( Click to restart";
  } else if (response.data.session.winner) {
    document.getElementById("winner").innerHTML =
      "Winner is " + response.data.session.winner + ". Click to restart";
  } else {
    document.getElementById(
      "winner"
    ).innerHTML = `It\'s <span id="currentTurn">${
      turn.number == 0 ? "X" : "O"
    }</span> turn`;
  }
  setBoard(response.data.session.board);
}

function handleGameActioned(response) {
  turn.number = response.data.turn === "X" ? 0 : 1;
  document.getElementById("winner").innerHTML = `It\'s <span id="currentTurn">${
    turn.number == 0 ? "X" : "O"
  }</span> turn`;
  setBoard(response.data.board);
}

function handleCreateRoomEvent() {
  socket.send(generateWebSocketPayload("createRoom", { userId: getUserId() }));
}

function handleJoinRoomEvent(gameSessionId) {
  socket.send(
    generateWebSocketPayload("joinRoom", {
      gameSessionId: gameSessionId,
      userId: getUserId(),
    })
  );
}
