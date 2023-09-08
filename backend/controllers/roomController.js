const express = require("express");
const router = express.Router();
const {
  createRoom,
  updateCode,
  fetchCode,
  joinRoom,
  leaveRoom,
  editPrivacy
} = require("../services/roomServices");

router
  .post("/create", createRoom)
  .put("/codeUpdate", updateCode)
  .put("/join", joinRoom)
  .put("/leave", leaveRoom)
  .put("/privacy", editPrivacy)
  .get("/fetchCode", fetchCode);

module.exports = router;
