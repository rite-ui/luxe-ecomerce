import mongoose from "mongoose";

export const connectDB = async () => {
     try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to monogoDB');
    } catch (error) {
        console.log("❌ MongoDB connection error:",error);
        process.exit(1);
    }
}