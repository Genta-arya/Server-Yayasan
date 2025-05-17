import express from "express";
import { RoutesAuth } from "./src/Routes/Auth.Routes.js";
import { RoutesBerita } from "./src/Routes/Berita.routes.js";
import { AnalyticRouter } from "./src/Routes/Analytic.route.js";
import { SpmbRouter } from "./src/Routes/Spmb.route.js";

const router = express.Router();

router.use("/api/v1/auth", RoutesAuth);
router.use("/api/v1/berita", RoutesBerita);
router.use("/api/v1/analytic", AnalyticRouter);
router.use("/api/v1/spmb", SpmbRouter);
export default router;
