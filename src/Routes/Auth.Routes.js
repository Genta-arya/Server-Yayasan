import express from "express";
import { handleLogin } from "../Controller/Authentikasi.controller.js";


export const RoutesAuth = express.Router();


RoutesAuth.post("/login", handleLogin);




