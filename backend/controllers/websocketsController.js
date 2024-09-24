const {
  generateRoomId,
  generateWebSocketError,
  generateWebSocketResponse,
} = require("../helper");

let sessions = [];

function Session({
  playerX,
  playerO = null,
  playerXSocket,
  playerOSocket = null,
}) {
  this.board = ["", "", "", "", "", "", "", "", ""];
  this.turn = "X";
  this.winner = null;
  this.playerX = playerX;
  this.playerO = playerO;
  this.playerXSocket = playerXSocket;
  this.playerOSocket = playerOSocket;
  this.id = generateRoomId();
}

exports.handleWebSocketConnection = (socket) => {
  console.log(
    `${socket._socket.remoteAddress}:${socket._socket.remotePort} connected`
  );

  // Check if the connection is a reconnect by checking if user is already in a session
  // session.findIndex((session) => session.pla);
};

exports.handleTestEvent = (socket, message) => {
  console.log("Test event");
  socket.send(`User id is ${message.data}`);
};

exports.handleCreateRoomEvent = (socket, message) => {
  console.log("Create room event");
  const session = new Session({
    playerX: message.data.userId,
    playerXSocket: socket,
  });

  // Delete any sessions created by this user when he creates a new one
  sessions = sessions.filter((elem) => elem.playerX !== session.playerX);
  sessions.push(session);

  // Sanitize data so user doesn't have easy access to his websocket
  const sessionClean = { ...session };
  delete sessionClean.playerXSocket;

  socket.send(
    generateWebSocketResponse("roomCreated", {
      session: sessionClean,
    })
  );
};

exports.handleJoinRoomEvent = (socket, message) => {
  console.log("Join room event");

  const index = sessions.findIndex(
    (session) => session.id === message.data.gameSessionId
  );

  const session = sessions[index];

  if (!session) {
    socket.send(generateWebSocketError("Session not found"));
    return;
  }

  if (message.data.userId == session.playerX) {
    socket.send(generateWebSocketError("Cannot join you own game"));
    return;
  }

  sessions[index].playerO = message.data.userId;
  sessions[index].playerOSocket = socket;

  // Sanitize data so users don't have access to each other sockets
  currentSessionData = { ...sessions[index] };
  delete currentSessionData.playerXSocket;
  delete currentSessionData.playerOSocket;

  sessions[index].playerXSocket.send(
    generateWebSocketResponse("roomJoined", {
      message: "Somebody joined",
      session: currentSessionData,
    })
  );

  socket.send(
    generateWebSocketResponse("roomJoined", {
      message: "You joined",
      session: currentSessionData,
    })
  );
};
