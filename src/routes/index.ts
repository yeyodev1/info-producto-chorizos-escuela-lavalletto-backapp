import express, { Application } from "express";
import payphoneRouter from "./payphone.routes";
import authRouter from "./auth.routes";

function routerApi(app: Application) {
  const router = express.Router();
  app.use("/api", router);

  router.use("/payphone", payphoneRouter);
  router.use("/auth", authRouter);
}

export default routerApi;
