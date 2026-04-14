import userModel from "../models/userModel.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import {getDataUri} from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import "dotenv/config"

export const register = async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;
        
        // req.file comes from multer middleware in your routes file
        const file = req.file; 

        if (!name || !email || !password || !phone || !role) {
            return res.status(400).json({ message: "Something is missing!", success: false });
        }

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Already registered!", success: false });
        }

        // --- Handle Image Upload (Optional for Register) ---
        let profilePhotoUrl = "";
        if (file) {
            const fileUri = getDataUri(file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
            profilePhotoUrl = cloudResponse.secure_url;
        }

        const hashedPassword = await bcrypt.hash(password, 11);

        const user = new userModel({
            name,
            email,
            password: hashedPassword,
            phone,
            role,
            profile: {
                profilePhoto: profilePhotoUrl // Save the uploaded photo
            }
        });

        await user.save();
        res.status(201).json({ success: true, message: "Account created successfully!", user });

    } catch (error) {
        console.error(error); // See the error in your terminal
        res.status(500).json({ success: false, message: "Error while registration...", error: error.message });
    }
}

// LOGIN
export const login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ message: "Something is missing!", success: false })
        }
        const user = await userModel.findOne({ email })
        if (!user) {
            return res.status(401).json({ message: "User not found!", success: false })
        }

        const match = await bcrypt.compare(password, user.password)
        if (!match) {
            return res.status(401).json({ message: "email or password is incorrect!", success: false })
        } else {
            // 1. Updated JWT expiration to 15 minutes
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "15m" })

            // 2. Updated Cookie maxAge to 15 minutes (15 * 60 * 1000 ms)
            const fifteenMinutesInMs = 15 * 60 * 1000;

            res.status(201).cookie("token", token, { 
                maxAge: fifteenMinutesInMs, 
                httpOnly: true, 
                sameSite: "strict" 
            })
            .json({
                success: true,
                message: `Welcome back ${user.name}`,
                token,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    profile: user.profile
                }
            })
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error while login...",
            error
        })
    }
}

// LOGOUT
export const logout = async (req, res) => {
    try {
        return res.status(200).cookie("token", "", { maxAge: 0 }).json({
            message: "Logout successfully!",
            success: true
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error while logout....",
            error
        })
    }
}



export const updateProfile = async (req, res) => {
    try {
        const { name, email, phone, bio, skills } = req.body;
        
        // Multer with .fields() puts files in req.files instead of req.file
        const resumeFile = req.files?.resume?.[0]; 
        const profilePhotoFile = req.files?.photo?.[0];

        const userId = req.user; 
        let user = await userModel.findById(userId);

        if (!user) {
            return res.status(400).json({ message: 'User not found!', success: false });
        }

        // --- Handle Resume Upload ---
       // Inside your updateProfile controller
if (resumeFile) {
    const fileUri = getDataUri(resumeFile);
    
    const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
    resource_type: "auto", // Change 'raw' to 'auto'
    folder: "resumes",
    format: "pdf"
});

    // Save this exact secure_url to your database
    user.profile.resume = cloudResponse.secure_url; 
    user.profile.resumeOriginalName = resumeFile.originalname;
}

        // --- Handle Profile Photo Upload ---
        if (profilePhotoFile) {
            const fileUri = getDataUri(profilePhotoFile);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
                folder: "profile_photos",
                transformation: [{ width: 500, height: 500, crop: "fill" }] // Optional: Crop to square
            });
            user.profile.profilePhoto = cloudResponse.secure_url;
        }

        // --- Update Other Fields ---
        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone; 
        if (bio) user.profile.bio = bio;
        if (skills) {
            user.profile.skills = skills.split(",").map(skill => skill.trim());
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully!",
            user
        });

    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
}

