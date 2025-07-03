import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

export const register = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, role } = req.body;
         
        console.log("Registration attempt:", { fullname, email, phoneNumber, role });
        
        if (!fullname || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({ message: "All fields are required", success: false });
        }
        
        const file = req.file; 
        let profilePhotoUrl = "";
        
        if (file) {
            const fileUri = getDataUri(file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
            profilePhotoUrl = cloudResponse.secure_url;
        } else {
            // Use a default avatar if no photo is uploaded
            profilePhotoUrl = "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg";
        }

        const user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exist with this email", success: false });

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Password hashed successfully");

        const newUser = await User.create({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            profile: {
                profilePhoto: profilePhotoUrl
            }
        });
        
        console.log("User created successfully:", { id: newUser._id, email: newUser.email, role: newUser.role });

        return res.status(201).json({
            message: "Account created successfully.",
            success: true
        });
    } catch (error) {
        console.log("Registration Error:", error);
        return res.status(500).json({ message: "Registration failed", success: false });
    }
}
export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        console.log("Login attempt:", { email, role });
        
        if (!email || !password || !role) return res.status(400).json({ message: "All fields are required", success: false });
        
        let user = await User.findOne({ email });
        console.log("User found:", user ? "Yes" : "No");
        if (user) {
            console.log("User details:", { id: user._id, email: user.email, role: user.role });
        }
        
        if (!user) return res.status(401).json({ message: "Incorrect email or password" });
        
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        console.log("Password match:", isPasswordMatch);
        
        if (!isPasswordMatch) return res.status(401).json({ message: "Incorrect email or password" });

        // check role is correct or not 
        console.log("Role check - Expected:", role, "Actual:", user.role);
        if (role !== user.role) {
            return res.status(400).json({ message: "Account doesn't exist with current role" })
        }
        
        console.log("Login - SECRET_KEY present:", !!process.env.SECRET_KEY);
        console.log("Login - User ID:", user._id);
        
        const tokenData = {
            userId: user._id,
        }
        const secretKey = process.env.SECRET_KEY || "fallback_secret_key_for_testing";
        const token = await jwt.sign(tokenData, secretKey, { expiresIn: '1d' });
        
        console.log("Login - Token created:", token ? "Yes" : "No");

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        }
        return res.status(200).cookie("token", token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'strict' }).json({
            message: `Welcome back ${user.fullname}`,
            user,
            success: true
        });
    } catch (error) {
        console.log("Login Error:", error);
        return res.status(500).json({ message: "Login failed", success: false });
    }
}
export const logout = async (req, res) => {
    try {
        return res.status(200).cookie("token", "", { maxAge: 0 }).json({
            message: "Logged out successfully",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
export const updateProfile = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, bio, skills } = req.body;
        const file = req.file;

        console.log("Update Profile - User ID:", req.id);
        console.log("Update Profile - Request Body:", req.body);

        if (!fullname || !email || !phoneNumber || !bio || !skills) {
            return res.status(400).json({ message: "All fields are required", success: false });
        }

        const skillsArray = skills.split(",");
        const userId = req.id;

        console.log("Update Profile - User ID type:", typeof userId);
        console.log("Update Profile - User ID length:", userId.length);
        console.log("Update Profile - Is valid ObjectId:", /^[0-9a-fA-F]{24}$/.test(userId));

        // Test: Check if there are any users in the database
        const allUsers = await User.find({});
        console.log("Update Profile - Total users in database:", allUsers.length);
        if (allUsers.length > 0) {
            console.log("Update Profile - First user ID:", allUsers[0]._id);
        }

        let user = await User.findById(userId);
        console.log("Update Profile - Found User:", user ? "Yes" : "No");
        console.log("Update Profile - User object:", user);
        
        if (!user) {
            // Let's also try to find the user by email to see if they exist
            const userByEmail = await User.findOne({ email });
            console.log("Update Profile - User by email:", userByEmail ? "Found" : "Not found");
            if (userByEmail) {
                console.log("Update Profile - User by email ID:", userByEmail._id);
                console.log("Update Profile - Token ID vs Email ID match:", userId === userByEmail._id.toString());
                
                // If user exists by email but ID doesn't match, use the correct user
                if (userId !== userByEmail._id.toString()) {
                    console.log("Update Profile - Using user found by email instead of token ID");
                    user = userByEmail;
                }
            }
            
            if (!user) {
                return res.status(400).json({ message: "User not found", success: false });
            }
        }

        // Updating the profile
        user.fullname = fullname;
        user.email = email;
        user.phoneNumber = phoneNumber;
        user.profile.bio = bio;
        user.profile.skills = skillsArray;

        // Update the resume URL and original file name only if a file is uploaded
        if (file) {
            console.log("Update Profile - File being uploaded:", file.originalname);
            console.log("Update Profile - File mimetype:", file.mimetype);
            console.log("Update Profile - File buffer length:", file.buffer ? file.buffer.length : 'No buffer');
            // Clean filename to avoid URL encoding issues
            const cleanFileName = file.originalname
                .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
                .replace(/\.pdf$/i, '') // Remove .pdf extension
                .substring(0, 50); // Limit length
            // Ensure proper file format for PDF uploads
            const uploadOptions = {
                resource_type: 'raw',
                format: 'pdf',
                public_id: `resumes/${Date.now()}_${cleanFileName}`,
                type: 'upload'
            };
            // Upload the raw buffer directly to Cloudinary
            const cloudResponse = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                });
                stream.end(file.buffer);
            });
            console.log("Update Profile - Cloudinary response:", cloudResponse);
            console.log("Update Profile - Resume URL:", cloudResponse.secure_url);
            user.profile.resume = cloudResponse.secure_url;
            user.profile.resumeOriginalName = file.originalname;
        }

        await user.save();

        // Prepare the user data to send in the response
        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        };

        return res.status(200).json({
            message: "Profile updated successfully.",
            user,
            success: true
        });
    } catch (error) {
        console.log("Update Profile Error:", error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};