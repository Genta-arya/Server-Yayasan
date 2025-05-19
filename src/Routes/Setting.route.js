import express from "express";
import { getMetaData, getSlider, SliderHandle } from "../Controller/Setting.controller.js";


export const SettingRouter = express.Router();


SettingRouter.post("/slider", SliderHandle);
SettingRouter.get("/slider", getSlider);
SettingRouter.get("/metadata" , getMetaData)