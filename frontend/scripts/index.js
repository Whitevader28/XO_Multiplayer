window.location.hash = "#menu";

document.getElementById("offline").onclick = function () {
  location.href = "../pages/playSolo.html";
};

document.getElementById("onlineCreate").onclick = async function () {
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
