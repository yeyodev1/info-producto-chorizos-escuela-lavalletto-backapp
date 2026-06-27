import mongoose from "mongoose";

export async function dbConnect() {
  const DB_URI = process.env.DB_URI;

  if (!DB_URI) {
    console.error("DB_URI is not defined in environment variables");
    return;
  }

  try {
    await mongoose.connect(DB_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}
