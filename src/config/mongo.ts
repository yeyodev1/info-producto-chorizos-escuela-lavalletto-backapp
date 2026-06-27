import mongoose from "mongoose";

let connecting: Promise<void> | null = null;

mongoose.connection.on("disconnected", () => {
  connecting = null;
});

export async function dbConnect() {
  const DB_URI = process.env.DB_URI;

  if (!DB_URI) {
    throw new Error("DB_URI is not defined in environment variables");
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (mongoose.connection.readyState === 2) {
    await new Promise<void>((resolve) => {
      mongoose.connection.once("connected", () => resolve());
    });
    return;
  }

  await mongoose.connect(DB_URI, {
    serverSelectionTimeoutMS: 5000,
  });

  console.log("Connected to MongoDB");
}

export function ensureDbConnected() {
  if (mongoose.connection.readyState !== 1) {
    connecting = null;
  }

  if (!connecting) {
    connecting = dbConnect().catch((err) => {
      console.error("MongoDB connection error:", err);
      connecting = null;
      throw err;
    });
  }
  return connecting;
}
