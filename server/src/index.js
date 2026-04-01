import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import { errorhandler } from "./middleware/errorMiddleware.js";

// CONFIG
dotenv.config();

// DB CONFIG
connectDB();

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// APP CONFIG
const app =  express();

// ─── Security ──────────────────────────────────────────────────────── middleware
app.use(helmet());

app.use(cors());

// ─── Rate Limiter ─────────────────────────────────────────────────
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {success: false, message: "Too many requests, please try again later."},
}));

// ─── Core Middleware ─────────────────────────────────────────────────
app.use(express.json({limit: "10mb"}));
app.use(express.urlencoded({ extended: true , limit: "10mb"}));
app.use(cookieParser());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ─── Global Error Handler ─────────────────────────────────────────────
app.use(errorhandler);


// LISTENER
const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>{
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
})