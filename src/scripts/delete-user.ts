import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../models/User.model";
import { Payment } from "../models/Payment.model";
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("❌ Uso: npx ts-node src/scripts/delete-user.ts <email> [BORRAR]");
    process.exit(1);
  }

  console.log(`\n🔍 Buscando usuario: ${email}\n`);

  const DB_URI = process.env.DB_URI;
  if (!DB_URI) {
    console.error("❌ DB_URI no está definida en .env");
    process.exit(1);
  }

  await mongoose.connect(DB_URI);

  const users = await User.find({ email: { $regex: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } });

  if (users.length === 0) {
    console.log("⚠️  No se encontraron usuarios con ese email.");
    await mongoose.disconnect();
    process.exit(0);
  }

  const payments = await Payment.find({ email: { $regex: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } });

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`📋  USUARIOS ENCONTRADOS: ${users.length}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  for (const u of users) {
    console.log(`  Email:              ${u.email}`);
    console.log(`  Transaction ID:     ${u.transactionId}`);
    console.log(`  Client Tx ID:       ${u.clientTransactionId}`);
    console.log(`  Access Granted:     ${u.accessGranted}`);
    console.log(`  Creado:             ${u.createdAt}`);
    console.log("  ─────────────────────────────");
  }
  console.log(`  Pagos relacionados: ${payments.length}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  if (payments.length > 0) {
    console.log("  PAGOS:");
    for (const p of payments) {
      console.log(`    • #${p.transactionId} — ${p.amount} ${p.currency} — ${p.transactionStatus}`);
    }
    console.log("");
  }

  const confirmed = process.argv[3] === "BORRAR";
  let answer = confirmed ? "BORRAR" : "";

  if (!confirmed) {
    answer = await ask("⚠️  ¿Eliminar todo? (escribe 'BORRAR' para confirmar): ");
  }

  if (answer !== "BORRAR") {
    console.log("❌ Operación cancelada.");
    await mongoose.disconnect();
    process.exit(0);
  }

  const userIds = users.map(u => u._id);
  const deletePayments = await Payment.deleteMany({ email: { $regex: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } });
  const deleteUser = await User.deleteMany({ _id: { $in: userIds } });

  console.log("\n✅  ELIMINADO CORRECTAMENTE");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  Usuarios:            ${deleteUser.deletedCount} documento(s)`);
  console.log(`  Pagos:               ${deletePayments.deletedCount} documento(s)`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  await mongoose.disconnect();
  rl.close();
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  mongoose.disconnect();
  rl.close();
  process.exit(1);
});
