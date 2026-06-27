import axios from "axios";

const PAYPHONE_CONFIRM_URL = "https://paymentbox.payphonetodoesposible.com/api/confirm";

interface ConfirmResponse {
  statusCode: number;
  transactionStatus: string;
  clientTransactionId: string;
  transactionId: number;
  authorizationCode: string;
  amount: number;
  currency: string;
  cardBrand: string;
  cardType: string;
  email: string;
  phoneNumber: string;
  document: string;
  storeName: string;
  reference: string;
  date: string;
  [key: string]: unknown;
}

export async function confirmPayment(
  id: number,
  clientTxId: string
): Promise<ConfirmResponse> {
  const token = process.env.PAYPHONE_TOKEN;

  if (!token) {
    throw new Error("PAYPHONE_TOKEN is not defined in environment variables");
  }

  const response = await axios.post<ConfirmResponse>(
    PAYPHONE_CONFIRM_URL,
    { id, clientTxId },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}
