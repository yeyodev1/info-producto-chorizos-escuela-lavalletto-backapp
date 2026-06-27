import { Request, Response } from "express";
import { confirmPayment } from "../services/payphone.service";
import { Payment } from "../models/Payment.model";
import { User } from "../models/User.model";
import {
  sendWelcomeEmail,
  sendAdminNotification,
  generatePassword,
} from "../services/email.service";
import { hashPassword } from "../services/auth.service";

export async function confirm(req: Request, res: Response) {
  try {
    const { id, clientTxId } = req.body;

    if (!id || !clientTxId) {
      res.status(400).json({ message: "id and clientTxId are required" });
      return;
    }

    const result = await confirmPayment(Number(id), String(clientTxId));

    if (result.statusCode === 3) {
      await Payment.findOneAndUpdate(
        { clientTransactionId: clientTxId },
        {
          transactionId: result.transactionId,
          clientTransactionId: result.clientTransactionId,
          amount: result.amount,
          currency: result.currency,
          statusCode: result.statusCode,
          transactionStatus: result.transactionStatus,
          authorizationCode: result.authorizationCode,
          cardBrand: result.cardBrand,
          cardType: result.cardType,
          email: result.email,
          phoneNumber: result.phoneNumber,
          document: result.document,
          storeName: result.storeName,
          reference: result.reference,
          date: result.date ? new Date(result.date) : undefined,
          rawResponse: result,
        },
        { upsert: true, new: true }
      );

      const buyerEmail = (result.email || `user_${clientTxId}@temp.com`).toLowerCase();
      const rawPassword = generatePassword();
      const hashed = await hashPassword(rawPassword);

      await User.findOneAndUpdate(
        { email: buyerEmail },
        {
          email: buyerEmail,
          password: hashed,
          phone: result.phoneNumber || "",
          clientTransactionId: clientTxId,
          transactionId: result.transactionId,
          accessGranted: true,
        },
        { upsert: true, new: true }
      );

      await sendWelcomeEmail(buyerEmail, rawPassword);

      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        await sendAdminNotification(adminEmail, result.transactionId, result.amount);
      }

      res.json({
        success: true,
        transactionId: result.transactionId,
        statusCode: result.statusCode,
        transactionStatus: result.transactionStatus,
        amount: result.amount,
        currency: result.currency,
        authorizationCode: result.authorizationCode,
        cardBrand: result.cardBrand,
        credentials: {
          email: buyerEmail,
          password: rawPassword,
        },
      });
      return;
    }

    res.json({
      success: result.statusCode === 3,
      transactionId: result.transactionId,
      statusCode: result.statusCode,
      transactionStatus: result.transactionStatus,
      amount: result.amount,
      currency: result.currency,
      authorizationCode: result.authorizationCode,
      cardBrand: result.cardBrand,
    });
  } catch (error: any) {
    console.error(
      "Payphone confirmation error:",
      error.response?.data || error.message
    );
    res.status(500).json({
      message: "Error confirming payment",
      error: error.response?.data || error.message,
    });
  }
}
