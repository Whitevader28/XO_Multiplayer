const wsURL = "ws://localhost:8080";

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
      case "error":
        handleErrorResponse(parsedMessage);
        break;

      default:
        console.log("Unkown event: ", event);
    }
  };

  socket.onclose = () => {
    // handleWebSocketClose();
  };

  return socket;
}

function handleErrorResponse(response) {
  console.log(response.data.message);
  alert(response.data.message);
}

function handleWebSocketClose() {
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
}

function handleLeaveRoomEvent() {
  socket.send(generateWebSocketPayload("leaveRoom", { userId: getUserId() }));
}

function handleGameActioned(response) {
  // TODO: display action
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
