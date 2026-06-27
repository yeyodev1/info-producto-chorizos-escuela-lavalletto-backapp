import crypto from "crypto";
import { User } from "../models/User.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function getUserByClientTxId(clientTransactionId: string) {
  return User.findOne({ clientTransactionId }).select("-__v");
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function findUserByEmail(email: string) {
  const users = await User.find({
    email: { $regex: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
  })
    .sort({ createdAt: -1 })
    .select("-__v")
    .limit(1);
  return users[0] || null;
}

export function generateToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email, accountType: "user" },
    process.env.JWT_SECRET as string,
    { expiresIn: "30d" }
  );
}

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function findUserByResetToken(token: string) {
  return User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: new Date() },
  }).select("-__v");
}
