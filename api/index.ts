import { createApp, ensureDbConnected } from "../src/app";

const { app } = createApp();

app.use((_req, _res, next) => {
  ensureDbConnected().catch(() => {});
  next();
});

export default app;
