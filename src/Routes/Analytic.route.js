import express from "express";
import { createAnalytic, handleLike } from "../Controller/Analytic.controller.js";

export const AnalyticRouter = express.Router();

AnalyticRouter.post("/", createAnalytic);
AnalyticRouter.post("/like", handleLike);