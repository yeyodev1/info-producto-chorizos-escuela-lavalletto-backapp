import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../models/User.model";
import { Payment } from "../models/Payment.model";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Uso: npx ts-node src/scripts/diagnose-user.ts <email>");
    process.exit(1);
  }

  const DB_URI = process.env.DB_URI;
  if (!DB_URI) throw new Error("DB_URI missing");
  await mongoose.connect(DB_URI);

  // Exact match (case-sensitive)
  const exactUser = await User.findOne({ email });
  // Case-insensitive match
  const ciUser = await User.findOne({ email: { $regex: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i") } });
  // All users with this email
  const allUsers = await User.find({ email: { $regex: new RegExp(email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i") } });

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`🔍 DIAGNÓSTICO: ${email}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  if (exactUser) {
    console.log("\n✅ Usuario encontrado (case-sensitive):");
    console.log(`  _id:               ${exactUser._id}`);
    console.log(`  email:             "${exactUser.email}"`);
    console.log(`  clientTxId:        ${exactUser.clientTransactionId}`);
    console.log(`  transactionId:     ${exactUser.transactionId}`);
    console.log(`  accessGranted:     ${exactUser.accessGranted}`);
    console.log(`  password (hash):   ${exactUser.password.substring(0, 30)}...`);
    console.log(`  password length:   ${exactUser.password.length}`);
    console.log(`  bcrypt?            ${exactUser.password.startsWith('$2')}`);
  } else {
    console.log("\n❌ NO encontrado por case-sensitive exact match");
  }

  if (!exactUser && ciUser) {
    console.log("\n⚠️  Encontrado SIN case-sensitive (email almacenado con mayúsculas):");
    console.log(`  email almacenado:  "${ciUser.email}"`);
  }

  if (allUsers.length > 1) {
    console.log(`\n⚠️  HAY ${allUsers.length} USUARIOS con este email:`);
    for (const u of allUsers) {
      console.log(`  • _id: ${u._id} — clientTxId: ${u.clientTransactionId} — email: "${u.email}"`);
    }
  } else {
    console.log(`\n📊 Total usuarios con este email: ${allUsers.length}`);
  }

  const payments = await Payment.find({ email: { $regex: new RegExp(email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i") } });
  console.log(`\n📊 Total pagos asociados: ${payments.length}`);
  for (const p of payments) {
    console.log(`  • #${p.transactionId} — ${p.amount} USD — ${p.transactionStatus} — email: "${p.email}"`);
  }

  await mongoose.disconnect();
}

main().catch(console.error);
