const {
  generateRoomId,
  generateWebSocketError,
  generateWebSocketResponse,
  getSocketId,
} = require("../helper");

const { checkWinner } = require("../gameLogic");

// 10 seconds to reconnect before session gets deleted
const RECONNECT_TIME_LIMIT = 5000;

let sessions = [];
let users = [];

function getUserIndexById(userId) {
  const index = users.findIndex((user) => user.id === userId);
  return index;
}

function getUserIndexBySocket(socket) {
  if (!socket) throw new Error("Socket doesnt't exist");

  const socketId = getSocketId(socket);

  return users.findIndex((user) => {
    const userSocketId = getSocketId(user.socket);
    return socketId === userSocketId;
  });
}

function User({ id, socket, online = true }) {
  this.id = id;
  this.socket = socket;
  this.online = online;
}

function getSessionIndexById(sessionId) {
  return sessions.findIndex((session) => session.id === sessionId);
}

function getSessionIndexByPlayerXIndex(playerIndex) {
  return sessions.findIndex((session) => session.playerXIndex === playerIndex);
}

function getSessionIndexByPlayerOIndex(playerIndex) {
  return sessions.findIndex((session) => session.playerOIndex === playerIndex);
}

// Removes sensitive information to send to user and returns a copy of the session
function cleanSessionByIndex(sessionIndex) {
  if (!sessions[sessionIndex]) throw new Error("session doesn't exist");
  const cleanSession = { ...sessions[sessionIndex] };
  delete cleanSession.playerXIndex;
  delete cleanSession.playerOIndex;
  return cleanSession;
}

function getSessionIndexBySocket(socket) {
  const socketId = getSocketId(socket);

  return sessions.findIndex((session) => {
    let playerXSocketId;
    let playerOSocketId;
    if (users[session.playerXIndex])
      playerXSocketId = getSocketId(users[session.playerXIndex].socket);
    if (users[session.playerOIndex])
      playerOSocketId = getSocketId(users[session.playerOIndex].socket);
    return socketId === playerOSocketId || socketId === playerXSocketId;
  });
}

// Trying to emulate an enum:
const STATUS = {
  PENDING: "PENDING",
  READY: "READY",
  STARTED: "STARTED",
  FINISHED: "FINISHED",
};

// A user can only be in one game at any given time
function Session({ playerXIndex, playerOIndex = null }) {
  this.status = STATUS.PENDING;
  this.board = ["", "", "", "", "", "", "", "", ""];
  this.turn = "X";
  this.winner = null;
  this.playerXIndex = playerXIndex;
  this.playerOIndex = playerOIndex;
  this.score = {
    X: 0,
    O: 0,
  };
  this.id = generateRoomId();
}

exports.handleWebSocketConnection = (socket) => {
  console.log(`${getSocketId(socket)} connected`);
};

function reconnect(socket, userId, userIndex) {
  // Update the players socket as it has a new one on each connection
  users[userIndex].socket = socket;

  // Set his status back to online
  users[userIndex].online = true;

  // Send room data back to him if he has one created and it hasn't started yet
  const sessionIndexAsPlayerX = getSessionIndexByPlayerXIndex(userIndex);
  const sessionIndexAsPlayerO = getSessionIndexByPlayerOIndex(userIndex);

  // Check if the user is the owner of a room which hasn't started yet
  if (sessionIndexAsPlayerX !== -1) {
    if (sessions[sessionIndexAsPlayerX].status === STATUS.PENDING) {
      socket.send(
        generateWebSocketResponse("roomCreated", {
          session: cleanSessionByIndex(sessionIndexAsPlayerX),
        })
      );
      return;
    }
  }

  const sessionIndex =
    sessionIndexAsPlayerX !== -1
      ? sessionIndexAsPlayerX
      : sessionIndexAsPlayerO;

  // Now we don't care which player he is, only if he is in a session
  if (sessionIndex !== -1) {
    // If the player was in an active game reconnect him to it
    if (sessions[sessionIndex].status === STATUS.STARTED) {
      socket.send(
        generateWebSocketResponse("roomJoined", {
          session: cleanSessionByIndex(sessionIndex),
        })
      );

      // Restore game info if any
      socket.send(
        generateWebSocketResponse("restoreInfo", {
          session: cleanSessionByIndex(sessionIndex),
        })
      );
      return;
    }
  }

  console.log(`${getSocketId(socket)} reconnected`);
}

exports.handleUserConnectEvent = (socket, message) => {
  const userIndex = getUserIndexById(message.data.userId);

  if (userIndex !== -1 && users[userIndex].online) {
    // If user already exists and is oniline on another browser session storage
    socket.send(
      generateWebSocketError(
        "User already connected on a browser try opening in another window to get a different user ID"
      )
    );
  } else if (userIndex !== -1) {
    // If user already exists and is offline try reconnecting him
    reconnect(socket, message.data.userId, userIndex);
    return;
  } else {
    // If not create a new one
    const user = new User({
      id: message.data.userId,
      socket: socket,
      online: true,
    });
    users.push(user);
  }

  console.log(`${getSocketId(socket)} connected`);
};

// If a player from a game leaves the session should be deleted and the other player disconnected from the session
exports.handleWebSocketClosing = (socket) => {
  const sessionIndex = getSessionIndexBySocket(socket);
  const userIndex = getUserIndexBySocket(socket);

  if (userIndex === -1) {
    console.log("Socket wasn't connected to a user on closing");
    return;
  }

  // Set user as offline to check for reconnects later
  users[userIndex].online = false;
  console.log("closed");

  if (sessionIndex !== -1) {
    // He is in a session, give him time to reconnect before deleting the room
    setTimeout(() => {
      // Check if the user reconnected
      if (users[userIndex].online) {
        console.log("User had time to reconnect");
        return;
      }

      if (!users[userIndex]) {
        console.log("Close user doesn't exist");
        return;
      }

      if (!sessions[sessionIndex]) {
        console.log("Close session doesn't exist");
        return;
      }

      // If both player exist
      if (
        users[seesions[sessionIndex].playerOIndex] &&
        users[seesions[sessionIndex].playerXIndex]
      ) {
        // Get the other player's socket
        const toBeDisconnectedSocket =
          sessions[sessionIndex].playerXIndex === userIndex
            ? users[sessions[sessionIndex].playerOIndex].socket
            : users[sessions[sessionIndex].playerXIndex].socket;

        // We now treat what response will the other player get
        if (toBeDisconnectedSocket) {
          toBeDisconnectedSocket.send(
            generateWebSocketResponse("roomDeleted", {
              message: "The other player left",
            })
          );
        }
      }

      // Delete the user and the session
      sessions.splice(sessionIndex, 1);
      users.splice(userIndex, 1);
    }, RECONNECT_TIME_LIMIT);
  } else {
    // // User wasn't part of any rooms
    // // Delete only the user after timeout
    setTimeout(() => {
      // Check if the user reconnected
      if (!users[userIndex]) {
        console.log("Close user doesn't exist");
        return;
      }

      if (users[userIndex].online) {
        console.log("User had time to reconnect");
        return;
      }

      users.splice(userIndex, 1);
      console.log(`${getSocketId(socket)} disconnected`);
    }, RECONNECT_TIME_LIMIT);
  }
};

exports.handleTestEvent = (socket, message) => {
  console.log("Test event");
  socket.send(`User id is ${message.data}`);
};

exports.handleCreateRoomEvent = (socket, message) => {
  console.log("Create room event");

  const playerXIndex = getUserIndexById(message.data.userId);

  if (playerXIndex === -1) {
    throw new Error("User doesn't exist in memory");
  }

  const session = new Session({
    playerXIndex: playerXIndex,
  });

  // Delete any sessions created by this user when he creates a new one
  sessions = sessions.filter(
    (elem) => elem.playerXIndex !== session.playerXIndex
  );
  sessions.push(session);

  // Sanitize data
  const sessionClean = { ...session };
  delete sessionClean.playerXIndex;
  delete sessionClean.playerOIndex;

  socket.send(
    generateWebSocketResponse("roomCreated", {
      session: sessionClean,
    })
  );
};

exports.handleJoinRoomEvent = (socket, message) => {
  console.log("Join room event");

  const sessionIndex = getSessionIndexById(message.data.gameSessionId);

  const session = sessions[sessionIndex];

  if (!session) {
    socket.send(generateWebSocketError("Session not found"));
    return;
  }

  if (session.status != STATUS.PENDING) {
    socket.send(generateWebSocketError("This game might have already started"));
    return;
  }

  if (message.data.userId == users[session.playerXIndex].id) {
    socket.send(generateWebSocketError("Cannot join your own game"));
    return;
  }

  sessions[sessionIndex].playerOIndex = getUserIndexById(message.data.userId);

  // Set the game status to started (it can be ready if you want to set a start game button or smth)
  sessions[sessionIndex].status = STATUS.STARTED;

  // Sanitize data so users don't have access to each other sockets
  currentSessionData = { ...sessions[sessionIndex] };
  delete currentSessionData.playerXIndex;
  delete currentSessionData.playerOIndex;

  const playerXSocket = users[sessions[sessionIndex].playerXIndex].socket;

  playerXSocket.send(
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

exports.handleGameActionEvent = (socket, message) => {
  const userIndex = getUserIndexById(message.data.userId);
  const sessionIndex = getSessionIndexBySocket(socket);

  if (userIndex === -1) {
    socket.send(generateWebSocketError("User doesn't exist"));
    return;
  }

  if (users[userIndex].socket !== socket) {
    socket.send(
      generateWebSocketError("This is not the correct socket for this user")
    );
    return;
  }

  if (sessionIndex === -1) {
    socket.send(generateWebSocketError("Game doesn't exist"));
    return;
  }

  if (sessions[sessionIndex].status !== STATUS.STARTED) {
    socket.send(generateWebSocketError("Game hasn't started yet"));
    return;
  }

  // For player X turn
  if (
    sessions[sessionIndex].turn === "X" &&
    sessions[sessionIndex].playerXIndex === userIndex
  ) {
    console.log("X Turn: " + message.data.position);

    sessions[sessionIndex].board[message.data.position] = "X";
    sessions[sessionIndex].turn = "O";

    const otherSocket = users[sessions[sessionIndex].playerOIndex].socket;

    socket.send(
      generateWebSocketResponse("gameActioned", {
        board: sessions[sessionIndex].board,
        turn: sessions[sessionIndex].turn,
      })
    );

    otherSocket.send(
      generateWebSocketResponse("gameActioned", {
        board: sessions[sessionIndex].board,
        turn: sessions[sessionIndex].turn,
      })
    );
  } else if (
    // For O player turn
    sessions[sessionIndex].turn === "O" &&
    sessions[sessionIndex].playerOIndex === userIndex
  ) {
    console.log("O Turn: " + message.data.position);

    sessions[sessionIndex].board[message.data.position] = "O";
    sessions[sessionIndex].turn = "X";

    const otherSocket = users[sessions[sessionIndex].playerXIndex].socket;

    socket.send(
      generateWebSocketResponse("gameActioned", {
        board: sessions[sessionIndex].board,
        turn: sessions[sessionIndex].turn,
      })
    );

    otherSocket.send(
      generateWebSocketResponse("gameActioned", {
        board: sessions[sessionIndex].board,
        turn: sessions[sessionIndex].turn,
      })
    );
  } else {
    console.log("Not your turn");
    socket.send(generateWebSocketError("Not your turn"));
    return;
  }

  // Current turn gets modified before checking winner so we have to go back one step
  const previousTurn = sessions[sessionIndex].turn === "X" ? "O" : "X";

  if (checkWinner(previousTurn, sessions[sessionIndex].board)) {
    console.log("WINNER");
    let winner = "";

    if (previousTurn === "X") {
      sessions[sessionIndex].score.X++;
      winner = "X";
    } else {
      sessions[sessionIndex].score.O++;
      winner = "O";
    }

    sessions[sessionIndex].winner = winner;
    sessions[sessionIndex].score;
    const otherSocket =
      sessions[sessionIndex].playerXIndex === userIndex
        ? users[sessions[sessionIndex].playerOIndex].socket
        : users[sessions[sessionIndex].playerXIndex].socket;

    socket.send(
      generateWebSocketResponse("gameFinished", {
        score: sessions[sessionIndex].score,
        winner: winner,
      })
    );

    otherSocket.send(
      generateWebSocketResponse("gameFinished", {
        score: sessions[sessionIndex].score,
        winner: winner,
      })
    );
    return;
  }

  const turnCount = sessions[sessionIndex].board.reduce((acc, elem) => {
    return acc + (elem !== "" ? 1 : 0);
  }, 0);

  console.log(turnCount);

  // Send draw event
  if (turnCount >= 9) {
    const otherSocket =
      sessions[sessionIndex].playerXIndex === userIndex
        ? users[sessions[sessionIndex].playerOIndex].socket
        : users[sessions[sessionIndex].playerXIndex].socket;

    sessions[sessionIndex].winner = "draw";

    socket.send(generateWebSocketResponse("gameDraw", {}));
    otherSocket.send(generateWebSocketResponse("gameDraw", {}));
  }
};

exports.handleGameResetEvent = (socket, message) => {
  const userIndex = getUserIndexBySocket(socket);
  const sessionIndex = getSessionIndexBySocket(socket);

  if (!sessions[sessionIndex]) {
    console.log("Session doesn't exist on reset");
    return;
  }

  if (!users[userIndex]) {
    console.log("User doesn't exist on reset");
    return;
  }

  const otherSocket =
    sessions[sessionIndex].playerXIndex === userIndex
      ? users[sessions[sessionIndex].playerOIndex].socket
      : users[sessions[sessionIndex].playerXIndex].socket;

  sessions[sessionIndex].winner = null;
  sessions[sessionIndex].turn = "X";
  sessions[sessionIndex].board = ["", "", "", "", "", "", "", "", ""];

  socket.send(generateWebSocketResponse("gameReseted", {}));
  otherSocket.send(generateWebSocketResponse("gameReseted", {}));
};

exports.handleLeaveRoomEvent = (socket, message) => {
  const sessionIndex = getSessionIndexBySocket(socket);
  const userIndex = getUserIndexBySocket(socket);

  if (userIndex === -1) {
    console.log("User not set in memory on closing, index: ");
    return;
  }

  socket.send(
    generateWebSocketResponse("roomDeleted", {
      message: "You left",
    })
  );

  // Get the other player's socket
  const toBeDisconnectedSocket =
    sessions[sessionIndex].playerXIndex === userIndex
      ? users[sessions[sessionIndex].playerOIndex].socket
      : users[sessions[sessionIndex].playerXIndex].socket;

  // We now treat what response will the other player get
  if (toBeDisconnectedSocket) {
    toBeDisconnectedSocket.send(
      generateWebSocketResponse("roomDeleted", {
        message: "The other player left",
      })
    );
  }

  // Delete the session
  sessions.splice(sessionIndex, 1);
};
