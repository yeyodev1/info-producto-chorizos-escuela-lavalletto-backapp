import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import routerApi from "./routes";
import { ensureDbConnected } from "./config/mongo";
import { globalErrorHandler } from "./middlewares/globalErrorHandler.middleware";

const whitelist = [
  "http://localhost:8101",
  "http://localhost:8080",
  "http://localhost:5173",
  "http://localhost:5174",
  "https://testing-storybrand-frontend.bakano.ec",
  "https://testing-storybrand-backapp.bakano.ec",
  "https://lavalletto-chorizos.netlify.app",
];

const envOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map(o => o.trim())
  .filter(Boolean);

const allowedOrigins = [...whitelist, ...envOrigins];

export function createApp() {
  const app = express();

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    maxAge: 86400,
  }));

  app.use(express.json({ limit: "50mb" }));

  app.get("/", (_req, res) => {
    res.send("Server is alive");
  });

  app.use(async (req, res, next) => {
    if (req.method === "OPTIONS" || req.path === "/") {
      next();
      return;
    }
    try {
      await ensureDbConnected();
      next();
    } catch {
      res.status(503).json({
        message: "Base de datos no disponible, intentalo de nuevo en unos segundos",
      });
    }
  });

  routerApi(app);

  app.use(globalErrorHandler);

  const server = http.createServer(app);

  return { app, server };
}
