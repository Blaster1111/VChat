import { Server } from "socket.io";
import http from 'http';
import express from "express";
import { decodeAuthToken } from "../middleware/protectRoute.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://vchat-bpx8.onrender.com"],
    methods: ["GET", "POST"]
  }
});

export const getReceiverSocketId = (receiverId) => {
  return Object.entries(usersSocketMap).find(([userId, socketId]) => userId === receiverId.toString())?.[1];
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

  socket.on('authToken', async (authToken) => {
    try {
      const decodedToken = decodeAuthToken(authToken);
      const senderId = decodedToken.userId;
      socket.senderId = senderId; // Setting the senderId on the socket object
      socket.emit('senderIdReceived', senderId);
    } catch (error) {
      console.error('Error decoding authToken:', error);
    }
  });

  socket.on('message', async ({ message, receiverId }) => {
    try {
      const senderId = socket.senderId;
      const newMessage = new Message({ senderId, receiverId, message });
      let conversation = await Conversation.findOne({ participants: { $all: [senderId, receiverId] } });
      if (!conversation) {
        conversation = await Conversation.create({ participants: [senderId, receiverId] });
      }
      conversation.messages.push(newMessage._id);
      await Promise.all([conversation.save(), newMessage.save()]);
  
      // Emit the message to the sender
      socket.emit('newMessage', newMessage);
  
      // Check if the receiver is not the same as the sender
      if (senderId !== receiverId) {
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('newMessage', newMessage);
        }
      }
    } catch (error) {
      console.error('Error handling message event:', error);
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    const userId = socket.handshake.query.userId;
    if (userId) {
      delete usersSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(usersSocketMap));
    }
  });
});

export { app, io, server };