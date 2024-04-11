// import jwt from 'jsonwebtoken';
// import User from '../models/user.model.js';

// const protectRoute = async(req,res,next)=>{
//     try {
//         const token = req.cookies.jwt;
//         if(!token){
//             return res.status(401).json({error:"Unauthorized - No Token Provided"});
//         }

//         const decoded = jwt.verify(token,process.env.JWT_SECRET);
//         if(!decoded){
//             return res.status(401).json({error:"Unauthorized - Invalid Token"});
//         }

//         const user = await User.findById(decoded.userId).select("-password");

//         if(!user){
//             return res.status(404).json({error:"User Not Found"});
//         }

//         req.user = user;
//         next();
//     } catch (error) {
//         console.log("Error in protectRoute middleware:",error.message);
//         res.status().json({error:"Internal Server Error"});
//     }
// };

// export default protectRoute;
import jwt from 'jsonwebtoken';

export const generateAuthToken = (userId) => {
    try {
        return jwt.sign({ userId }, process.env.JWT_SECRET, {
            expiresIn: '7d' // Example expiry time, adjust as needed
        });
    } catch (error) {
        console.log("Error in generating token:", error.message);
        throw error;
    }
};

export const decodeAuthToken = (authToken) => {
    try {
        const decodedToken = jwt.verify(authToken, process.env.JWT_SECRET);
        return decodedToken;
    } catch (error) {
        throw new Error("Error in decodingAuthToken/Invalid authToken")
    }
}
