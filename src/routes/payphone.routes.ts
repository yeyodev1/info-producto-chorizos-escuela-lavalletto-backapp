import express from "express";
import { confirm } from "../controllers/payphone.controller";

const payphoneRouter = express.Router();

payphoneRouter.post("/confirm", confirm);

export default payphoneRouter;
