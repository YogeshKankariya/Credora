import { Router } from "express";
import { getRevocations } from "../controllers/revocation.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireIssuerOrAdmin } from "../middleware/role.middleware.js";

const router = Router();

// GET /api/revocations — list all revocations for the authenticated issuer
router.get("/", authenticate, requireIssuerOrAdmin, getRevocations);

export default router;
