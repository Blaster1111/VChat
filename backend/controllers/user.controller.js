import User from "../models/user.model.js";
import { decodeAuthToken } from "../middleware/protectRoute.js"

export const getUsersForSidebar = async(req,res)=>{
    try {
        const authToken = req.headers.authorization;
        if (!authToken) {
            return res.status(401).json({ error: "Unauthorized - No AuthToken provided" });
        }
        try {
            const decodedToken = decodeAuthToken(authToken);
            // const loggedInUserId = req.user._id;
            const loggedInUserId = decodedToken.userId;
            const filteredUser = await User.find({_id:{$ne:loggedInUserId}}).select("-password");
            //ne = not equal to this says that find user which is not equal to the logged in id
        res.status(200).json(filteredUser);
        } catch (error) {
            return res.status(401).json({ error: "Unauthorized - Invalid AuthToken" });
        }        
    } catch (error) {
        console.error("Error in getUserForSidebar controller:",error.message);
        res.status(500).json({error:"Internal Server Error"});
    }
}