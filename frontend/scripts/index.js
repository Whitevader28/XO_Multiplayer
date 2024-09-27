const socket = connect();

window.location.hash = "#menu";

// TODO: don't let the user create a game if he is already in a started game
// TODO: add messages to join to know if the game you are trying to join does not exist
// TODO: reconnect logic

document.getElementById("offline").onclick = function () {
  preventOnClose = true;
  window.location.href = "../pages/playSolo.html";
};

document.getElementById("leaveButton").onclick = function () {
  try {
    if (socket.readyState !== WebSocket.OPEN) {
      sendWaitConnectionMessage();
      return;
    }
    handleLeaveRoomEvent();
  } catch (e) {
    console.error(e);
  }
};

document.getElementById("onlineCreate").onclick = function () {
  try {
    if (socket.readyState !== WebSocket.OPEN) {
      sendWaitConnectionMessage();
      return;
    }
    handleCreateRoomEvent();
  } catch (e) {
    console.error(e);
  }
};

function sendWaitConnectionMessage(
  message = "Connecting to server, please wait"
) {
  document.getElementById("connectionError").innerHTML = message;
}

// Validate sessionId form and call handler
function joinSession(event) {
  event.preventDefault();

  const form = event.target;
  const gameSessionId = form.sessionId.value.trim();

  const createdGameId = document
    .getElementById("createdRoomId")
    .innerHTML.split(" ")[2];

  // Warn user if he tries to join his own game
  if (gameSessionId == createdGameId) {
    document.getElementById("joinError").innerHTML =
      "Cannot join your own game";
    throw new Error("Cannot join your own game");
  }

  // Delete error message if the session id is valid
  document.getElementById("joinError").innerHTML = "";

  handleJoinRoomEvent(gameSessionId);
}
