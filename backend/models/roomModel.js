const mongoose = require("mongoose");

const roomSchema = mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
  },
  code: {
    type: String,
  },
  users: [
    {
      type: String,
    },
  ],
});

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
