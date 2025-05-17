import express from "express";
import {
  getDetailSpmb,
  getSpmbData,
  handleSpmb,
} from "../Controller/Spmb.controller.js";

export const SpmbRouter = express.Router();

SpmbRouter.post("/", handleSpmb);
SpmbRouter.get("/:type", getDetailSpmb);
SpmbRouter.get("/", getSpmbData);
