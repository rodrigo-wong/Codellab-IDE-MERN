const express = require("express");
const cors = require("cors");
const socketIO = require("socket.io");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const roomController = require("./controllers/roomController");
const { spawn } = require("child_process");
//const fetch = require("node-fetch");
const { log } = require("console");

dotenv.config();

connectDB();
const app = express();

app.use(express.json());
app.use(cors());

app.use(cors({
  origin:`${process.env.CORS_ORIGIN}`,
}));

app.use("/room", roomController);

const PORT = process.env.PORT;
const server = app.listen(PORT, console.log(`Server live in ${PORT}`));

const io = socketIO(server, {
  pingtTimeout: 60000,
  cors: {
    origin:`${process.env.CORS_ORIGIN}`,
  },
});

io.on("connection", (socket) => {
  console.log(socket.id, " connected to socket.io");

  socket.on("joinRoom", (data) => {
    console.log(data.roomId);
    socket.join(data.roomId);
    socket.to(data.roomId).emit("usersUpdate", data);
    console.log(socket.id, " joined ", data.roomId);
  });
  socket.on("leaveRoom", async(data) => {
    const roomInfo = data.roomInfo;
    const fetch = await import("node-fetch");
    try {
      const newRoomInfo = await fetch.default(
        `${process.env.SERVER_URL}/room/leave`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomId: roomInfo.roomId,
            name: data.user.name,
          }),
        }
      ).then((res) => res.json());
      socket.to(roomInfo.roomId).emit("usersUpdate", newRoomInfo);
      socket.leave(data.roomId);
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("sendMessage", (data)=> {
    //console.log(data);
    const sender = data.user.name
    const roomId = data.user.room
    const message = data.newMessage
    //console.log(sender, roomId, message);
    socket.to(roomId).emit("receiveMessage", {sender:sender, message:message})
  })

  socket.on("sendCodeUpdate", (data) => {
    const room = data.room;
    socket.to(room).emit("receiveCodeUpdate", data.code);
  });

  let pythonProcess;

  socket.on("run-python", async (code) => {
    if (pythonProcess && !pythonProcess.killed) {
      pythonProcess.kill();
      pythonProcess = null;
      return;
    }

    let outputLines = 0;
    const maxOutputLines = 500;
  
    pythonProcess = spawn("python3", ["-c", `${code}`]);
  
    pythonProcess.stdout.on("data", (data) => {
      const lines = data.toString().split('\n');
      //console.log(lines);
      
      for (const line of lines) {
        if (outputLines < maxOutputLines) {
          //console.log(line);
          socket.emit("python-output", { output: line});
          outputLines++;
        } else {
          socket.emit("python-output", { kill: true });
          pythonProcess.kill();
        }
      }
    });

    pythonProcess.stderr.on("data", (data) => {
      socket.emit("python-output", { output: data.toString(), kill: true });
      pythonProcess.kill();
      //pythonProcess = null;
    });

    pythonProcess.on("close", (code) => {
      if (code === 0) {
        console.log("Python process has finished successfully.");
        socket.emit("python-output", {
          output: "Code finished running...",
          kill: true,
        });
        //pythonProcess.kill();
        pythonProcess = null;
      }
    });
  });

  socket.on("send-input", (input) => {
    if (pythonProcess && !pythonProcess.killed) {
      pythonProcess.stdin.write(input + "\n");
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});
