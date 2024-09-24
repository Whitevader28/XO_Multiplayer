const express = require("express");
const router = express.Router();
const sessionController = require("../controllers/sessionController");

// Define routes and map them to controller functions
router.get("/", sessionController.home);
router.get("/board", sessionController.getBoard);
router.get("/freeSession", sessionController.getFreeSession);
router.post("/createSession", sessionController.createSession);

module.exports = router;
