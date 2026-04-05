import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path  from "path";
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


// Route imports
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import userRoutes from "./routes/user.js";
import orderRoutes from "./routes/order.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import reviewRoutes from "./routes/reviews.routes.js";
import adminRoutes from "./routes/admin.routes.js";

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

// ─── Static Uploads ──────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── API Routes ───────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews',  reviewRoutes);
app.use('/api/admin',    adminRoutes);

// ─── Health Check ─────────────────────────────────────────────────────
app.get('/api/health', (_req, res) =>
  res.json({ success: true, message: '🚀 LUXE API running', env: process.env.NODE_ENV })
);

// ─── Serve React (Production) ─────────────────────────────────────────
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(join(__dirname, '../client/dist')));
//   app.get('*', (_req, res) =>
//     res.sendFile(join(__dirname, '../client/dist/index.html'))
//   );
// }

// ─── Global Error Handler ─────────────────────────────────────────────
app.use(errorhandler);

// ─── 404 ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.originalUrl} not found` 
  });
});


// LISTENER
const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>{
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
})