import { Request, Response } from "express";
import {
  getUserByClientTxId,
  findUserByEmail,
  verifyPassword,
  generateToken,
  generateResetToken,
  findUserByResetToken,
  hashPassword,
} from "../services/auth.service";
import { sendResetPasswordEmail } from "../services/email.service";
import { AuthRequest } from "../types/AuthRequest";
import { Payment } from "../models/Payment.model";

export async function getCredentials(req: Request, res: Response) {
  try {
    const clientTransactionId = req.params.clientTransactionId as string;

    if (!clientTransactionId) {
      res.status(400).json({ message: "clientTransactionId is required" });
      return;
    }

    const user = await getUserByClientTxId(clientTransactionId);

    if (!user) {
      res.status(404).json({ message: "User not found for this transaction" });
      return;
    }

    res.json({
      email: user.email,
      password: user.password,
    });
  } catch (error: any) {
    console.error("Error fetching credentials:", error.message);
    res.status(500).json({ message: "Error fetching credentials" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await findUserByEmail(email);

    if (!user) {
      res.status(401).json({ message: "Credenciales inválidas" });
      return;
    }

    const valid = await verifyPassword(password, user.password);

    if (!valid) {
      res.status(401).json({ message: "Credenciales inválidas" });
      return;
    }

    const token = generateToken(user._id.toString(), user.email);

    res.json({
      token,
      user: {
        email: user.email,
        transactionId: user.transactionId,
        clientTransactionId: user.clientTransactionId,
      },
    });
  } catch (error: any) {
    console.error("Error logging in:", error.message);
    res.status(500).json({ message: "Error al iniciar sesión" });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    const user = await findUserByEmail(email);

    if (!user) {
      res.status(200).json({
        message:
          "Si el correo existe, recibiras un enlace para recuperar tu contrasena",
      });
      return;
    }

    const resetToken = generateResetToken();

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL || "https://testing-storybrand-frontend.bakano.ec"}/acceso/restablecer?token=${resetToken}`;

    const sent = await sendResetPasswordEmail(user.email, resetLink);

    if (!sent) {
      res.status(500).json({ message: "Error al enviar el correo" });
      return;
    }

    res.json({
      message:
        "Si el correo existe, recibiras un enlace para recuperar tu contrasena",
    });
  } catch (error: any) {
    console.error("Error in forgotPassword:", error.message);
    res.status(500).json({ message: "Error al procesar la solicitud" });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(400).json({ message: "Token and password are required" });
      return;
    }

    if (password.length < 6) {
      res
        .status(400)
        .json({ message: "La contrasena debe tener al menos 6 caracteres" });
      return;
    }

    const user = await findUserByResetToken(token);

    if (!user) {
      res
        .status(400)
        .json({ message: "Token invalido o expirado" });
      return;
    }

    user.password = await hashPassword(password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Contrasena actualizada exitosamente" });
  } catch (error: any) {
    console.error("Error in resetPassword:", error.message);
    res.status(500).json({ message: "Error al restablecer la contrasena" });
  }
}

export async function getMyPayments(req: AuthRequest, res: Response) {
  try {
    const payments = await Payment.find({
      email: { $regex: new RegExp(`^${req.user!.email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
    })
      .sort({ date: -1 })
      .select("transactionId clientTransactionId amount currency transactionStatus date");

    res.json(payments);
  } catch (error: any) {
    console.error("Error fetching payments:", error.message);
    res.status(500).json({ message: "Error al obtener los pagos" });
  }
}

export async function me(req: AuthRequest, res: Response) {
  try {
    const user = await findUserByEmail(req.user!.email);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({
      email: user.email,
      transactionId: user.transactionId,
      clientTransactionId: user.clientTransactionId,
    });
  } catch (error: any) {
    console.error("Error fetching user:", error.message);
    res.status(500).json({ message: "Error fetching user" });
  }
}
