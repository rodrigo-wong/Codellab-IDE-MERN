const express = require("express");
const router = express.Router();
const {
  createRoom,
  updateCode,
  fetchCode,
  joinRoom,
  leaveRoom,
} = require("../services/roomServices");

router
  .post("/create", createRoom)
  .put("/codeUpdate", updateCode)
  .put("/join", joinRoom)
  .put("/leave", leaveRoom)
  .get("/fetchCode", fetchCode);

module.exports = router;
