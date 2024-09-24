exports.home = (req, res) => {
  res.send("Hi!");
};

exports.getBoard = (req, res) => {};

exports.getFreeSession = (req, res) => {};

exports.createSession = (req, res) => {
  console.log(req.body);
  res.send(req.body.playerXid + "foo");
};
