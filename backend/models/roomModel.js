const { Timestamp } = require("mongodb");
const mongoose = require("mongoose");

const roomSchema = mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
    },
    users: [
      {
        type: String,
      },
    ],
    editingPrivacy: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
