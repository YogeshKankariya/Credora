import { Router } from "express";
import { getPendingKYC, getKYCStatus, approveKYC, rejectKYC } from "../controllers/kyc.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireIssuerOrAdmin } from "../middleware/role.middleware.js";

const router = Router();

// GET /api/kyc/pending — issuer only
router.get("/pending", authenticate, requireIssuerOrAdmin, getPendingKYC);

// GET /api/kyc/:customerId — issuer or the customer themselves
router.get("/:customerId", authenticate, getKYCStatus);

// POST /api/kyc/:customerId/approve — issuer only
router.post("/:customerId/approve", authenticate, requireIssuerOrAdmin, approveKYC);

// POST /api/kyc/:customerId/reject — issuer only
router.post("/:customerId/reject", authenticate, requireIssuerOrAdmin, rejectKYC);

export default router;
