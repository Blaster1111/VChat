import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js"
import messageRoutes from "./routes/message.routes.js"
import userRoutes from "./routes/user.routes.js"
import connectToMongoDB from "./db/connectToMongoDB.js";
import { app,server } from "./socket/socket.js";

const PORT = process.env.PORT || 3000;

dotenv.config(); // port is a variable in .env wala file and its taking value from there to run server instead of giving a hardcoded value

app.use(express.json()); //to parse the incoming requests with JSON payloads(from req.body)
app.use(cookieParser());

app.use("/auth",authRoutes); //it says that some route starts with api/auth and its directing to auth.route then auth.controller then user.model
app.use("/messages",messageRoutes);
app.use("/users",userRoutes);


app.get("/",(req,res)=>{
    //root route more like home page ka route http://localhost:3000/
    res.send("Hello World!!");
});



server.listen(PORT,()=>{
    connectToMongoDB();
    console.log(`Server is runing on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});