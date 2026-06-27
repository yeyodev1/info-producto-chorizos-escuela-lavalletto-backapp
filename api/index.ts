import { createApp, ensureDbConnected } from "../src/app";

const { app } = createApp();

app.use(async (req, _res, next) => {
  if (req.method === "OPTIONS" || req.path === "/") {
    next();
    return;
  }
  try {
    await ensureDbConnected();
  } catch {
    // will retry next request
  }
  next();
});

export default app;
