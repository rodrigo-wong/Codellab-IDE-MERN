const express = require("express");
const cors = require("cors");
const socketIO = require("socket.io");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const roomController = require("./controllers/roomController");
const { spawn } = require("child_process");
const cron = require("node-cron");
const Room = require("./models/roomModel");

dotenv.config();

connectDB();
const app = express();

app.use(express.json());

app.use(
  cors({
    origin: [`${process.env.CORS_ORIGIN}`, `${process.send.CHATBOT_ORIGIN}`],
  })
);

app.use("/room", roomController);

const PORT = process.env.PORT;
const server = app.listen(PORT, console.log(`Server live in ${PORT}`));

const WebSocket = require('ws');
const wss = new WebSocket.Server({ server: server, path: "/webrtc" });

wss.on('connection', function connection(ws) {
  console.log('A client connected to the WebRTC WebSocket server.');

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);

    // Broadcast the message to all clients except the sender
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', function close() {
    console.log('A client disconnected from the WebRTC WebSocket server.');
  });
});


cron.schedule("0 * * * *", async () => {
  const threshold = new Date();
  threshold.setHours(threshold.getHours() - 48);

  try {
    const result = await Room.deleteMany({ updatedAt: { $lt: threshold } });
  } catch (error) {
    console.error("Error deleting room:", error);
  }
});

const io = socketIO(server, {
  pingtTimeout: 60000,
  cors: {
    origin: `${process.env.CORS_ORIGIN}`,
  },
});

io.on("connection", (socket) => {
  console.log(socket.id, " connected to socket.io");

  // Relay signaling messages
  socket.on("signal", (data) => {
    io.to(data.to).emit("signal", {
      from: socket.id,
      ...data,
    });
  });

  socket.on("joinRoom", (data) => {
    //console.log(data.roomId);
    socket.join(data.roomId);
    socket.to(data.roomId).emit("usersUpdate", data);
    console.log(socket.id, " joined ", data.roomId);
  });

  socket.on("privacyUpdate", (data) => {
    //console.log(data);
    socket.to(data.roomId).emit("usersUpdate", data);
  });

  socket.on("leaveRoom", async (data) => {
    const roomInfo = data.roomInfo;
    const fetch = await import("node-fetch");
    try {
      const newRoomInfo = await fetch
        .default(`${process.env.SERVER_URL}/room/leave`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomId: roomInfo.roomId,
            name: data.user.name,
          }),
        })
        .then((res) => res.json());
      socket.to(roomInfo.roomId).emit("usersUpdate", newRoomInfo);
      socket.leave(data.roomId);
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("sendMessage", (data) => {
    //console.log(data);
    const sender = data.user.name;
    const roomId = data.user.room;
    const message = data.newMessage;
    //console.log(sender, roomId, message);
    socket
      .to(roomId)
      .emit("receiveMessage", { sender: sender, message: message });
  });

  let pythonProcess;

  socket.on("runPython", async (code) => {
    if (pythonProcess && !pythonProcess.killed) {
      pythonProcess.kill();
      pythonProcess = null;
      return;
    }

    let outputLines = 0;
    const maxOutputLines = 500;

    pythonProcess = spawn("python3", ["-c", `${code}`]);

    pythonProcess.stdout.on("data", (data) => {
      const lines = data.toString().split("\n");
      //console.log(lines);

      for (const line of lines) {
        if (outputLines < maxOutputLines) {
          //console.log(line);
          socket.emit("pythonOutput", { output: line });
          outputLines++;
        } else {
          socket.emit("pythonOutput", { kill: true });
          pythonProcess.kill();
        }
      }
    });

    pythonProcess.stderr.on("data", (data) => {
      socket.emit("pythonOutput", { output: data.toString(), kill: true });
      pythonProcess.kill();
      //pythonProcess = null;
    });

    pythonProcess.on("close", (code) => {
      if (code === 0) {
        console.log("Python process has finished successfully.");
        socket.emit("pythonOutput", {
          output: "Code finished running...",
          kill: true,
        });
        //pythonProcess.kill();
        pythonProcess = null;
      }
    });
  });

  socket.on("sendInput", (input) => {
    if (pythonProcess && !pythonProcess.killed) {
      pythonProcess.stdin.write(input + "\n");
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});
