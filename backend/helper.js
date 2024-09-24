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

module.exports = {
  generateRoomId,
  generateWebSocketResponse,
  generateWebSocketError,
};
