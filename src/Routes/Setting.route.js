import express from "express";
import {
  getMetaData,
  getProfil,
  GetSambutan,
  getSlider,
  getUnitPendidikan,
  handleProfil,
  handleSambutan,
  handleUnitPendidikan,
  SliderHandle,
} from "../Controller/Setting.controller.js";
import { GalleryHandle, getGallery } from "../Controller/Gallery.controller.js";

export const SettingRouter = express.Router();

SettingRouter.post("/slider", SliderHandle);
SettingRouter.get("/slider", getSlider);
SettingRouter.get("/metadata", getMetaData);
SettingRouter.get("/sambutan", GetSambutan);
SettingRouter.post("/sambutan", handleSambutan);
SettingRouter.post("/unitpendidikan", handleUnitPendidikan);
SettingRouter.get("/unitpendidikan", getUnitPendidikan);
SettingRouter.post("/gallery", GalleryHandle);
SettingRouter.get("/gallery", getGallery);
SettingRouter.post("/profil", handleProfil)
SettingRouter.get("/profil", getProfil);
