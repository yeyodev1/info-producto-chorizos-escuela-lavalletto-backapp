import express from "express";
import {
  getCredentials,
  login,
  forgotPassword,
  resetPassword,
  me,
  getMyPayments,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const authRouter = express.Router();

authRouter.get("/credentials/:clientTransactionId", getCredentials);
authRouter.post("/login", login);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
authRouter.get("/me", authMiddleware, me);
authRouter.get("/payments", authMiddleware, getMyPayments);

export default authRouter;
