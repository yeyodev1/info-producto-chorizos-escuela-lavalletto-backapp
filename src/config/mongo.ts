import mongoose from "mongoose";

let connecting: Promise<void> | null = null;

mongoose.set("bufferTimeoutMS", 3000);

mongoose.connection.on("disconnected", () => {
  connecting = null;
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error event:", err);
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
    socketTimeoutMS: 5000,
    maxPoolSize: 1,
    minPoolSize: 0,
  });

  console.log("Connected to MongoDB");
}

function pingWithTimeout(): Promise<void> {
  return Promise.race([
    mongoose.connection.db!.admin().ping().then(() => undefined),
    new Promise<void>((_, reject) =>
      setTimeout(() => reject(new Error("MongoDB ping timeout")), 3000)
    ),
  ]);
}

export async function ensureDbConnected() {
  if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
    try {
      await pingWithTimeout();
      return;
    } catch (err) {
      console.warn("MongoDB ping failed, reconnecting:", err);
      connecting = null;
    }
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
