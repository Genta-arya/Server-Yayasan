import express from "express";
import { getMetaData, GetSambutan, getSlider, getUnitPendidikan, handleSambutan, handleUnitPendidikan, SliderHandle } from "../Controller/Setting.controller.js";


export const SettingRouter = express.Router();


SettingRouter.post("/slider", SliderHandle);
SettingRouter.get("/slider", getSlider);
SettingRouter.get("/metadata" , getMetaData)
SettingRouter.get("/sambutan" , GetSambutan)
SettingRouter.post("/sambutan" , handleSambutan)
SettingRouter.post("/unitpendidikan" , handleUnitPendidikan)
SettingRouter.get("/unitpendidikan" , getUnitPendidikan)