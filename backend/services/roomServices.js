const Room = require("../models/roomModel");
const expressAsyncHandler = require("express-async-handler");

const createRoom = expressAsyncHandler(async (req, res) => {
  const { roomId, name } = req.body;

  if (roomId && name) {
    try {
      // Check if the room with the given roomId already exists
      const existingRoom = await Room.findOne({ roomId: roomId });
      if (existingRoom) {
        return res.status(400).json({ message: 'Room already exists' });
      }

      // If the room does not exist, create a new room
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
      if (!room) {
        return res.status(400).json({ message: 'Room does not exist.' });
      }
      res.json(room);
    } catch (err) {
      res.status(401).send(err.message);
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

const editPrivacy = expressAsyncHandler(async (req, res) => {
  const { privacy, roomId } = req.body;
  const room = await Room.findOneAndUpdate(
    { roomId: roomId },
    { editingPrivacy: privacy },
    { new: true }
  );
  if (room) res.status(200).json(room);
  else res.status(400);
});

module.exports = {
  createRoom,
  joinRoom,
  leaveRoom,
  editPrivacy,
};
