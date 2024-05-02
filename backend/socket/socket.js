import { Server } from "socket.io";
import http from 'http';
import express from "express";
import { decodeAuthToken } from "../middleware/protectRoute.js";
import Message from '../models/message.model.js';

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
  
    io.emit("getOnlineUsers", Object.keys(usersSocketMap));
  
    socket.on("disconnect", () => {
      console.log("user disconnected", socket.id);
      const userId = socket.handshake.query.userId;
      if (userId) {
        delete usersSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(usersSocketMap));
      }
    });
  
    socket.on('message', (data) => {
        const { message, receiverId, senderId } = data;
        const roomId = [senderId, receiverId].sort().join('-'); // Create a unique room ID for each pair of users
        const newMessage = new Message({ senderId, receiverId, message });
        newMessage.save();
        io.to(roomId).emit('newMessage', newMessage);
      });
  
    socket.on('joinRoom', (roomIds) => {
        const roomIdArray = roomIds.split(',');
        roomIdArray.forEach(roomId => {
          socket.join(roomId);
          console.log(`Socket ${socket.id} joined room ${roomId}`);
        });
      });
});



export { app,io,server };