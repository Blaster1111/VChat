import mongoose from "mongoose";
//message sending schema
const messageSchema = new mongoose.Schema({
    senderId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required:true
    },
    receiverId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    message:{
        type: String,
        required: true
    },
},
{timestamps:true}, //this will allow sending time to send the time at which the message was send.
);

const Message= mongoose.model("Message",messageSchema);

export default Message;