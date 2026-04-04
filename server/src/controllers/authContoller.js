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

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
    const fields = { name: req.body.name, phone: req.body.phone, addresses: req.body.addresses };
    const user = await User.findByIdAndUpdate(req.user.id, fields, { new: true, runValidators: true });
    res.json({ success: true, data: user });
});

// PUT /api/auth/change-password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    res.status(401); throw new Error('Current password incorrect');
  }
  user.password = newPassword;
  await user.save();
  sendToken(user, 200, res);
});
// POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) { res.status(400); throw new Error('Email not found'); }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // In production, send email with resetToken here. For now, return it in response
    res.json({ success: true, resetToken });
});

// PUT /api/auth/reset-password/:token
export const resetPassword = asyncHandler(async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user   = await User.findOne({
    resetPasswordToken:  hashed,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) { res.status(400); throw new Error('Invalid or expired reset token'); }

  user.password            = req.body.password;
  user.resetPasswordToken  = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  sendToken(user, 200, res);
});

// PUT /api/auth/wishlist/:productId
export const toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const pid  = req.params.productId;
  const idx  = user.wishlist.indexOf(pid);
  idx === -1 ? user.wishlist.push(pid) : user.wishlist.splice(idx, 1);
  await user.save();
  res.json({ success: true, wishlist: user.wishlist });
});

