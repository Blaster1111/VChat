    import { decodeAuthToken } from "../middleware/protectRoute.js";
    import Conversation from "../models/conversation.model.js";
    import Message from "../models/message.model.js";
    import { io } from '../socket/socket.js';
    import { getReceiverSocketId } from "../socket/socket.js";

    export const sendMessage = async(req,res)=>{
        try {
            const authToken = req.headers.authorization;
            if (!authToken) {
                return res.status(401).json({ error: "Unauthorized - No AuthToken provided" });
            }
            const decodedToken = decodeAuthToken(authToken);
            const senderId = decodedToken.userId;
            const {message} = req.body; //getting input of message from the user.
            const {id: receiverId} = req.params;
            // const senderId = req.user._id;

            let conversation = await Conversation.findOne({
                participants: { $all: [senderId,receiverId] },
            });

            if(!conversation){  
                conversation = await Conversation.create({
                    participants: [senderId,receiverId],
                });
            }

            const newMessage = new Message({
                senderId,
                receiverId,
                message,
            });

            if(newMessage){
                conversation.messages.push(newMessage._id);
            }
            // await conversation.save();
            // await message.save();
            //commenting this coz it will take longer time as await is there instead we use promises of js

            //this will run in parallel above will not run in parallel
            await Promise.all([conversation.save(),newMessage.save()]);

            //SOCKET IO FUNCTIONALITY WILL COME HERE
            const receiverRoom = receiverId;
io.to(receiverRoom).emit("newMessage", newMessage);



            res.status(201).json(newMessage);
        } catch (error) {
            console.log("Error in sendMessage controller",error.message);
            res.status(500).json({error:"Internal Server Error"});
        }
    };

    export const getMessages = async (req, res) => {
        try {
            const authToken = req.headers.authorization;
            if (!authToken) {
                return res.status(401).json({ error: "Unauthorized - No AuthToken provided" });
            }
            const decodedToken = decodeAuthToken(authToken);
            const senderId = decodedToken.userId;
            const { id: userToChatId } = req.params;
            // const senderId = req.user._id;

            const conversation = await Conversation.findOne({
                participants: { $all: [senderId, userToChatId] },
            }).populate("messages"); // NOT REFERENCE BUT ACTUAL MESSAGES

            if (!conversation) return res.status(200).json([]);

            const messages = conversation.messages;

            res.status(200).json(messages);
        } catch (error) {
            console.log("Error in getMessages controller: ", error.message);
            res.status(500).json({ error: "Internal server error" });
        }
    };