import express, { Application } from "express";
import mongoose from "mongoose";
import payphoneRouter from "./payphone.routes";
import authRouter from "./auth.routes";

function routerApi(app: Application) {
  const router = express.Router();
  app.use("/api", router);

  router.get("/health/db", async (_req, res) => {
    const start = Date.now();
    try {
      const readyState = mongoose.connection.readyState;
      const states = ["disconnected", "connected", "connecting", "disconnecting"];
      let pingResult = "not attempted";
      let writeResult = "not attempted";

      if (readyState === 1 && mongoose.connection.db) {
        try {
          await mongoose.connection.db.admin().ping();
          pingResult = "ok";
        } catch (err: any) {
          pingResult = `failed: ${err.message}`;
        }
      }

      try {
        await mongoose.connection.collection("health_checks").insertOne({ ts: new Date() });
        writeResult = "ok";
      } catch (err: any) {
        writeResult = `failed: ${err.message}`;
      }

      res.json({
        readyState,
        stateName: states[readyState] || "unknown",
        pingResult,
        writeResult,
        elapsedMs: Date.now() - start,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message, elapsedMs: Date.now() - start });
    }
  });

  router.use("/payphone", payphoneRouter);
  router.use("/auth", authRouter);
}

export default routerApi;
