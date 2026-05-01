import { Router } from "express";
import { authHandlers, getCurrentUser, loginWithGoogle, logout } from "../controllers/auth.controller.js";

export const authRouter = Router();

authRouter.post("/google", loginWithGoogle);
authRouter.get("/me", authHandlers.requireAuth, getCurrentUser);
authRouter.post("/logout", authHandlers.requireAuth, logout);
