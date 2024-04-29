import { Server } from "socket.io";
import http from 'http';
import express from "express";
import { decodeAuthToken } from "../middleware/protectRoute.js";

const app = express();

const server = http.createServer(app);
const io = new  Server(server,{
    cors:{
        origin:["https://vchat-bpx8.onrender.com"],
        methods:["GET","POST"]
    }
});

export const getReceiverSocketId = (receiverId) =>{
    return usersSocketMap[receiverId];
};

const usersSocketMap = {}; //{userId:socketId}

io.on('connection', (socket) => {
    console.log("a user connected", socket.id);
    const authToken = socket.handshake.query.authToken;
    const userId = decodeAuthToken(authToken);
  
    if (userId !== "undefined") {
      usersSocketMap[userId] = socket.id;
      io.emit("getOnlineUsers", Object.keys(usersSocketMap));
    }
  
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`User ${userId} joined room ${roomId}`);
    });
  
    socket.on("disconnect", () => {
      console.log("user disconnected", socket.id);
      const userId = socket.handshake.query.userId;
      if (userId) {
        delete usersSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(usersSocketMap));
      }
    });
  
    socket.on("message", (msg) => {
      console.log("Received message:", msg);
      const { receiverId, message } = msg;
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("message", { senderId: userId, message });
      } else {
        console.log("Receiver not found.");
      }
    });
  });



export { app,io,server };