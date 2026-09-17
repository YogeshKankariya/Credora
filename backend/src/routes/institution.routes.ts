import { Router } from "express";
import { getTrustedIssuers } from "../controllers/verification.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import prisma from "../config/database.js";
import { sendSuccess, sendError, sendServerError } from "../utils/response.js";
import { param } from "../utils/params.js";

const router = Router();

// GET /api/institutions
router.get("/", authenticate, async (_req, res) => {
  try {
    const institutions = await prisma.institutionProfile.findMany({
      select: {
        id: true, name: true, shortName: true, institutionCode: true,
        did: true, role: true, status: true, accreditedDate: true,
      },
      orderBy: { name: "asc" },
    });
    sendSuccess(res, institutions);
  } catch (err) {
    console.error("[institutions.getAll]", err);
    sendServerError(res);
  }
});

// GET /api/institutions/trusted
router.get("/trusted", authenticate, getTrustedIssuers);

// GET /api/institutions/:id
router.get("/:id", authenticate, async (req, res) => {
  try {
    const id = param(req, "id");
    const institution = await prisma.institutionProfile.findUnique({
      where: { id },
      include: {
        issuedCredentials: {
          select: { id: true, credentialId: true, status: true },
          take: 20,
          orderBy: { issuedAt: "desc" },
        },
      },
    });
    if (!institution) { sendError(res, "Institution not found", 404); return; }
    sendSuccess(res, institution);
  } catch (err) {
    console.error("[institutions.getById]", err);
    sendServerError(res);
  }
});

export default router;
