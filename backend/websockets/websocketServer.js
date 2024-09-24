const WebSocket = require("ws");
const wsServer = new WebSocket.Server({ port: "8080" });
const webSocketController = require("../controllers/websocketsController");

wsServer.on("connection", (socket) => {
  webSocketController.handleWebSocketConnection(socket);

  socket.on("message", (message) => {
    const parsedMessage = JSON.parse(message);
    handleWebSocketEvent(socket, parsedMessage);
  });

  socket.on("close", () => {
    console.log(
      `${socket._socket.remoteAddress}:${socket._socket.remotePort} disconnected`
    );
  });
});

function handleWebSocketEvent(socket, message) {
  switch (message.event) {
    case "test":
      webSocketController.handleTestEvent(socket, message);
      break;
    case "createRoom":
      webSocketController.handleCreateRoomEvent(socket, message);
      break;
    case "joinRoom":
      webSocketController.handleJoinRoomEvent(socket, message);
      break;

    default:
      console.log("Unkown event: ", message.event);
  }
}
