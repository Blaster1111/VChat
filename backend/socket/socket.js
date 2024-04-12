import { Server } from "socket.io";
import http from 'http';
import express from "express";

const app = express();

const server = http.createServer(app);
const io = new  Server(server,{
    cors:{
        // origin:["http://localhost:3000"],
        origin:["https://vchat-bpx8.onrender.com/"],
        methods:["GET","POST"]
    }
});

export const getReceiverSocketId = (receiverId) =>{
    return usersSocketMap[receiverId];
};

const usersSocketMap = {}; //{userId:socketId}

io.on('connection',(socket)=>{
    console.log("a user connected",socket.id);

    const userId = socket.handshake.query.userId;
    if(userId!="undefined") usersSocketMap[userId] = socket.id;

    io.emit("getOnlineUsers",Object.keys(usersSocketMap));

    //socket.on() is used to listen to the events. can be used both on client and server side.
    socket.on("disconnect",()=>{
        console.log("user disconnected",socket.id);
        delete usersSocketMap[userId];
        io.emit("getOnlineUsers",Object.keys(usersSocketMap));
    })
});



export { app,io,server };