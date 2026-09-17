import { Router } from "express";
import {
  verifyCredential,
  getVerificationHistory,
  getVerificationById,
  getTrustedIssuers,
} from "../controllers/verification.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

// POST /api/verification/verify
router.post("/verify", verifyCredential);

// GET /api/verification/history
router.get("/history", getVerificationHistory);

// GET /api/verification/:id
router.get("/:id", getVerificationById);

export default router;
