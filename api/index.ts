import { createApp, ensureDbConnected } from "../src/app";

const { app } = createApp();

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

export default app;
