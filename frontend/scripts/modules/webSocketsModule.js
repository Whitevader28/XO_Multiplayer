const wsURL = "ws://localhost:8080";

const socket = new WebSocket(wsURL);

socket.onopen = () => {
  document.getElementById("connectionError").innerHTML = "";
  document.getElementById("connectionMessage").innerHTML = "";

  socket.send(
    generateWebSocketPayload("checkReconnect", { userId: getUserId() })
  );
};

socket.onmessage = (event) => {
  const message = event.data;
  console.log(message);
  const parsedMessage = JSON.parse(message);

  switch (parsedMessage.event) {
    case "roomCreated":
      handleRoomCreatedResponse(parsedMessage.data.session.id);
      break;
    case "roomJoined":
      handleRoomJoinedResponse(parsedMessage);
      break;
    case "deleteRoom":
      handleDeleteRoomResponse(parsedMessage);
    case "error":
      console.log(parsedMessage.data.message);
      break;

    default:
      console.log("Unkown event: ", message.event);
  }
};

socket.onclose = () => {
  handleWebSocketClose();
};

function handleWebSocketClose() {
  document.getElementById("roomId").innnerHTML =
    " (you are not connected to a room yet)";
}

function handleDeleteRoomResponse(respones) {
  window.location.hash = "#menu";
}

function handleRoomCreatedResponse(id) {
  document.getElementById("createdRoomId").innerHTML = `Roomd id: ${id}`;
}

function handleRoomJoinedResponse(response) {
  window.location.hash = "#game";
  document.getElementById(
    "roomId"
  ).innerHTML = ` (room id: ${response.data.session.id})`;
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
