const express = require("express");
const app = express();

const server = require("http").createServer(app);
const { Server } = require("socket.io");
const { addUser, getUser, removeUser } = require("./utils/users");

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
        const users = addUser({name, userId, roomId, host, presenter, socketId:socket.id, });
        socket.emit("userIsJoined", {success: true, users});
        socket.broadcast.to(roomId).emit("userJoinedMessageBroadcasted", name);
        socket.broadcast.to(roomId).emit("allUsers", users);
        socket.broadcast.to(roomId).emit("whiteBoardDataResponse", {
            imageURL : imageURLGlobal,

        })
    });

    socket.on("whiteboardData", (data) => {
        imageURLGlobal = data;
        socket.broadcast.to(roomIdGlobal).emit("whiteBoardDataResponse", {
            imageURL: data,
        });
    });

    socket.on("disconnect", (data) => {
        const user = getUser(socket.id);
        if(user){
            removeUser(socket.id);
            socket.broadcast.to(roomIdGlobal).emit("userLeftMessageBroadcasted", user.name);
        };
    })

});


const port = process.env.PORT || 5000;
server.listen(port, () => 
    console.log("server is running on http://localhost:5000")
);