const express = require("express");
const router = express.Router();
const {
  createRoom,
  joinRoom,
  leaveRoom,
  editPrivacy
} = require("../services/roomServices");

router
  .post("/create", createRoom)
  .put("/join", joinRoom)
  .put("/leave", leaveRoom)
  .put("/privacy", editPrivacy)

module.exports = router;
