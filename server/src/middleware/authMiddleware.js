import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// ─── Protect: must be logged in ──────────────────────────────────────
export const protect = asyncHandler(async (req, res, next) =>{
    let token;

    if (req.headers.authorization?.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }else if (req.cookies?.token)
        token = req.cookies.token;

    if (!token) {
        res.status(401);
        throw new Error('Not authorised — please log in');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");
        if (!req.user) {
            res.status(401);
            throw new Error('User not found');
        }
    } catch (error) {
        res.status(401);
        throw new Error('Invalid or expired token');
    }
});

// ─── Authorize: role check ────────────────────────────────────────────
export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    res.status(403);
    throw new Error(`Role "${req.user.role}" is not authorised here`);
  }
  next();
};

// ─── Optional auth ─────────────────────────────────────────────────────

export const optionalAuth = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization?.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.token) {
        token = req.cookies.token;
    }
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");
        } catch (error) {/* silent — continue without user */}
    }
    next();
});