const express = require("express");
const app = express();

const server = require("http").createServer(app);
const { Server } = require("socket.io");

const io = new Server(server);

// routes
app.get("/", (req,res) => {
    res.send(
        "This is mern realtime board sharing app server"
    );
});

let roomIdGlobal, imageURLGlobal;

io.on("connection", (socket) => {
    // console.log("User connected");
    socket.on("userJoined", (data) => {
        const {name, userId, roomId, host, presenter} = data;
        roomIdGlobal = roomId;
        socket.join(roomId);
        socket.emit("userIsJoined", {success: true});
        socket.broadcast.to(roomId).emit("whiteBoardDataResponse", {
            imageURL : imageURLGlobal,

        })
    });

    socket.on("whiteboardData", (data) => {
        imageURLGlobal = data;
    })

});


const port = process.env.PORT || 5000;
server.listen(port, () => 
    console.log("server is running on http://localhost:5000")
);