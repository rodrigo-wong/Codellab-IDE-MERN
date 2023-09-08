const Room = require("../models/roomModel");
const expressAsyncHandler = require("express-async-handler");

const createRoom = expressAsyncHandler(async (req, res) => {
  const { roomId, name } = req.body;

  if (roomId && name) {
    try {
      const newRoom = await Room.create({
        roomId: roomId,
        users: name,
      });
      res.json(newRoom);
    } catch (err) {
      res.status(401).send(err.message);
      console.log(err.message);
    }
  }
});

const joinRoom = expressAsyncHandler(async (req, res) => {
  const { roomId, name } = req.body;

  if (roomId && name) {
    try {
      const room = await Room.findOneAndUpdate(
        { roomId: roomId },
        {
          $push: {
            users: name,
          },
        },
        { new: true }
      );
      res.json(room);
    } catch (err) {
      console.log(err.message);
    }
  }
});

const leaveRoom = expressAsyncHandler(async (req, res) => {
  const { name, roomId } = req.body;

  if (name && roomId) {
    try {
      const room = await Room.findOneAndUpdate(
        { roomId: roomId },
        {
          $pull: {
            users: { $in: [name] },
          },
        },
        { new: true }
      );

      if (room.users.length === 0) {
        //console.log("here");
        await Room.findByIdAndDelete(room._id);
      }
      res.json(room);
    } catch (err) {
      //console.log("in leaveRoom request");
      console.log(err.message);
    }
  }
});

const updateCode = expressAsyncHandler(async (req, res) => {
  const { code } = req.body;
  const { roomId } = req.query;

  try {
    const room = await Room.findOneAndUpdate(
      { roomId: roomId },
      { code: code }
    );
    if (room) {
      res.send("Succesfull update");
    } else {
      throw new Error("Room does not exist");
    }
  } catch (err) {
    console.log(err.message);
    res.send(err.message);
  }
});

const fetchCode = expressAsyncHandler(async (req, res) => {
  const { roomId } = req.query;

  try {
    const room = await Room.findOne({ roomId: roomId });
    res.send(room.code);
  } catch (err) {
    console.log(err.message);
  }
});

const editPrivacy = expressAsyncHandler(async (req, res) => {
  const { privacy, roomId } = req.body;
  const room = await Room.findOneAndUpdate(
    { roomId: roomId },
    { editingPrivacy: privacy },
    { new: true }
  );
  console.log("in editPrivacy");
  if (room) res.status(200).json(room);
  else res.status(400);
});

module.exports = {
  createRoom,
  updateCode,
  fetchCode,
  joinRoom,
  leaveRoom,
  editPrivacy,
};
