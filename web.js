import express from "express";
import { RoutesAuth } from "./src/Routes/Auth.Routes.js";

const router = express.Router();

router.use("/api/v1/auth", RoutesAuth);

export default router;
