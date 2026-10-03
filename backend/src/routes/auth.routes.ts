import { Router } from "express";
import { register, login, logout, getMe, googleLogin, verifyWalletAccess } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// POST /api/auth/register
router.post("/register", register);

// POST /api/auth/login
router.post("/login", login);

// POST /api/auth/google (Individual Google Authentication)
router.post("/google", googleLogin);

// POST /api/auth/verify-wallet
// Re-authenticates via Google and confirms the token email matches
// the signed-in user's registered email from the DB before unlocking wallet.
router.post("/verify-wallet", authenticate, verifyWalletAccess);

// POST /api/auth/logout
router.post("/logout", authenticate, logout);

// GET /api/auth/me
router.get("/me", authenticate, getMe);

export default router;