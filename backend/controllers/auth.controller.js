import bcryptjs from "bcryptjs";
import User from "../models/user.model.js";
// import generateTokenAndSetCookie from "../utils/generateToken.js";
import { generateAuthToken } from "../middleware/protectRoute.js";
//only generating authToken for app and not doing anything with cookies own logic modified...

export const signup = async(req,res) =>{
    try {
        const {
            fullName,username,password,confirmPassword,gender
        } = req.body;
        // checking and throwing error if password and confirm password arent matching then
        if(password!== confirmPassword){
                return res.status(400).json({error:"Passwords don't match"});
            }
        //checking whether the entered user is there in the db or not if there then throwing an error!!!
        const user = await User.findOne({username});
        if(user){
            return res.send(400).json({error:"Username aldready exists"});
        }

        //HASH PASSWORD HERE
        const salt = await bcryptjs.genSalt(10); //more the salt more the time taken to salt the password   
        const hashedPassword = await bcryptjs.hash(password, salt);

        //https://avatar.iran.liara.run/public/
        const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`
        const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`

        const newUser = new User({
            fullName,
            username,
            password:hashedPassword,
            gender,
            profilePic: gender=="male"?boyProfilePic:girlProfilePic,
        })

       if(newUser){
        //SET JWT TOKEN HERE...
        // const authToken = await generateTokenAndSetCookie(newUser._id,res);
        const authToken = await generateAuthToken(newUser._id);   
        await newUser.save();
        res.status(201).json({
            _id: newUser._id,
            fullName: newUser.fullName,
            username: newUser.username,
            profilePic: newUser.profilePic,
            authToken: authToken,
        });
       }
       else{
        res.status(400).json({error:"Invalid User Data"});
       }

    } catch (error) {
        console.log("Error in signup controller",error.message);
        res.status(500).json({error:"Internal Server Error"});
    }
}

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        const isPasswordCorrect = await bcryptjs.compare(password, user?.password || "");

        if (!user || !isPasswordCorrect) {
            return res.status(400).json({ error: "Invalid Username or Password" });
        }

        // generateTokenAndSetCookie(user._id, res);
        const authToken = generateAuthToken(user._id);
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            profilePic: user.profilePic,
            authToken: authToken,
        });
    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

