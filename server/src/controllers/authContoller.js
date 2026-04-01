import asyncHandler from "express-async-handler";
import crypto from "crypto";
import User from "../models/user.model.js";
import { sendToken } from "../utils/sendToken.js";


// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "Please fill all fields" });
    }
    
    const existingUser = await User.findOne({
        $or: [ { email } , { name } ],
    });

    if (existingUser) {
        return res.status(400).json({ success: false, message: "User already exists" });
    }

    const user = await User.create({name, email, password});
    user.lastlogin = Date.now();
    await user.save({ validateBeforeSave: false });

    return sendToken(user, 201, res);
});

// POST /api/auth/login

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {res.status(400); throw new Error(" Provide email and password");}

    const user = await User.findOne({email}).select("+password");
    if (!user|| !(await user.comparePassword(password))) {
        res.status(401);
        throw new Error("Invalid email or password");
    }

    user.lastlogin = Date.now();
    await user.save({ validateBeforeSave: false });

    return sendToken(user, 200, res);
});

// GET /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
    res.cookie('token', '',{maxAge: 1 , httpOnly: true});
    res.status(200).json({ success: true, message: "Logged out successfully" });
});
