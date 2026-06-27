import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  transactionId: number;
  clientTransactionId: string;
  amount: number;
  currency: string;
  statusCode: number;
  transactionStatus: string;
  authorizationCode: string;
  cardBrand: string;
  cardType: string;
  email: string;
  phoneNumber: string;
  document: string;
  storeName: string;
  reference: string;
  rawResponse: object;
  date: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    transactionId: { type: Number, required: true, unique: true },
    clientTransactionId: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    statusCode: { type: Number, required: true },
    transactionStatus: { type: String, required: true },
    authorizationCode: { type: String },
    cardBrand: { type: String },
    cardType: { type: String },
    email: { type: String },
    phoneNumber: { type: String },
    document: { type: String },
    storeName: { type: String },
    reference: { type: String },
    rawResponse: { type: Schema.Types.Mixed },
    date: { type: Date },
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPayment>("Payment", PaymentSchema);
