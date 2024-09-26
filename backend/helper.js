function generateRoomId() {
  return "xxxxxxxx".replace(/[x]/g, function (char) {
    const randChar = (Math.random() * 16) | 0,
      v = char === "x" ? randChar : (randChar & 0x3) | 0x8;
    return v.toString(16);
  });
}

function generateWebSocketError(message) {
  return JSON.stringify({
    event: "error",
    data: {
      message: message,
    },
  });
}

function generateWebSocketResponse(eventName, payload) {
  return JSON.stringify({
    event: eventName,
    data: payload,
  });
}

// Creates the "id" of a socket to identify it from remotePort and remoteAdress
function getSocketId(socket) {
  return `${socket._socket.remoteAddress}:${socket._socket.remotePort}`;
}

module.exports = {
  generateRoomId,
  generateWebSocketResponse,
  generateWebSocketError,
  getSocketId,
};
