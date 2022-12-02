const express = require("express");

const io = require("socket.io")({
  path: "/webrtc",
});

const app = express();
const port = 8080;

app.get("/", (req, res) => {
  res.send("HELLO");
});

const server = app.listen(port, () => {
  console.log(`app listening on ${port}`);
});

io.listen(server);
io.of("webRTCPeers", (socket) => {
  console.log(socket.id);
  socket.on("disconnect", () => {
    console.log(`${socket.id} disconnected`);
  });
  socket.emit("connection-success", {
    status: "connection-status",
    socketId: socket.id,
  });
  socket.on("sdp", (data) => {
    console.log(data);
    socket.broadcast.emit("sdp", data);
  });
  socket.on("candidate", (data) => {
    console.log(data);
    socket.broadcast.emit("candidate", data);
  });
});
