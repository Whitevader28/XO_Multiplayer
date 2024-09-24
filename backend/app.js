const express = require("express");
const sessionRountes = require("./routes/sessionRoutes");
const wsServer = require("./websockets/websocketServer");

const cors = require("cors");
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use("/", sessionRountes);

app.listen(port, () => {
  console.log("server listening on port " + port);
});
