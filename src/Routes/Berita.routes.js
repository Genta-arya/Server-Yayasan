import express from "express";
import { DeleteBerita, EditBerita, GetAllBerita, GetBeritaType, getDetailBerita, getDetailBeritaSlug, PostBerita, updateStatus } from "../Controller/Berita.controller.js";

export const RoutesBerita = express.Router();

RoutesBerita.post("/", GetAllBerita);
RoutesBerita.post("/post", PostBerita);
RoutesBerita.delete("/:id", DeleteBerita);
RoutesBerita.put("/arsip/:id", updateStatus);
RoutesBerita.put("/edit/:id", EditBerita);
RoutesBerita.get("/:id", getDetailBerita);
RoutesBerita.get("/detail/:slug", getDetailBeritaSlug);
RoutesBerita.get("/informasi/:type", GetBeritaType);