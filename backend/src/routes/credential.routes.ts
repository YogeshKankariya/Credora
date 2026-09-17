import { Router } from "express";
import {
  issueCredential,
  getCredentials,
  getCredentialById,
  getCredentialStatus,
} from "../controllers/credential.controller.js";
import { revokeCredential } from "../controllers/revocation.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireIssuerOrAdmin } from "../middleware/role.middleware.js";

const router = Router();

router.use(authenticate);

// POST /api/credentials — issue new credential (issuer only)
router.post("/", requireIssuerOrAdmin, issueCredential);

// GET /api/credentials — list all credentials
router.get("/", getCredentials);

// GET /api/credentials/:credentialId
router.get("/:credentialId", getCredentialById);

// GET /api/credentials/:credentialId/status
router.get("/:credentialId/status", getCredentialStatus);

// POST /api/credentials/:credentialId/revoke — revoke (issuer only)
router.post("/:credentialId/revoke", requireIssuerOrAdmin, revokeCredential);

export default router;
