const express = require("express");
const app = express();
const path = require("path");
const indexRouter = require("./routes/index");

const http = require("http");
const socketIO = require("socket.io");
const server = http.createServer(app);
const io = socketIO(server);

let waitingusers = [];
let rooms = {};

io.on("connection", function (socket) {
  socket.on("joinroom", function () {
    if (waitingusers.length > 0) {
      let partner = waitingusers.shift();
      const roomname = `${socket.id}-${partner.id}`;
      socket.join(roomname);
      partner.join(roomname);

      io.to(roomname).emit("joined");
    } else {
      waitingusers.push(socket);
    }
  });

  socket.on("disconnect", function () {
    let index = waitingusers.findIndex(
      (waitingusers) => waitingusers.id === socket.id
    );
    waitingusers.splice(index, 1);
  });
});

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);

server.listen(3000);
