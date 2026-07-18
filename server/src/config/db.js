import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
     try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error("MONGO_URI is not defined in the environment");
        }
        await mongoose.connect(mongoUri);
        console.log('Connected to monogoDB');
    } catch (error) {
        console.log("❌ MongoDB connection error:", error);
        process.exit(1);
    }
}