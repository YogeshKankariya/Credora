import { Request, Response } from "express";
import prisma from "../config/database.js";
import { sendSuccess, sendError, sendServerError } from "../utils/response.js";
import { param } from "../utils/params.js";

// GET /api/issuer/dashboard
export async function getIssuerDashboard(req: Request, res: Response): Promise<void> {
  try {
    const issuerId = req.user?.userId;
    if (!issuerId) { sendError(res, "Not authenticated", 401); return; }

    const institution = await prisma.institutionProfile.findUnique({
      where: { userId: issuerId },
    });

    if (!institution) { sendError(res, "Institution profile not found", 404); return; }

    const [totalIssued, totalActive, totalRevoked, recentCredentials] = await Promise.all([
      prisma.credential.count({ where: { issuerId: institution.id } }),
      prisma.credential.count({ where: { issuerId: institution.id, status: "ACTIVE" } }),
      prisma.credential.count({ where: { issuerId: institution.id, status: "REVOKED" } }),
      prisma.credential.findMany({
        where: { issuerId: institution.id },
        take: 5,
        orderBy: { issuedAt: "desc" },
        include: { customer: { include: { user: { select: { name: true } } } } },
      }),
    ]);

    sendSuccess(res, {
      institution,
      stats: { totalIssued, totalActive, totalRevoked },
      recentCredentials,
    });
  } catch (err) {
    console.error("[issuer.getDashboard]", err);
    sendServerError(res);
  }
}

// GET /api/issuer/customers
export async function getIssuerCustomers(req: Request, res: Response): Promise<void> {
  try {
    const customers = await prisma.customerProfile.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
    sendSuccess(res, customers);
  } catch (err) {
    console.error("[issuer.getCustomers]", err);
    sendServerError(res);
  }
}

// GET /api/issuer/customers/:id
export async function getIssuerCustomerDetail(req: Request, res: Response): Promise<void> {
  try {
    const id = param(req, "id");
    const customer = await prisma.customerProfile.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        credentials: {
          include: { blockchainRecord: true, revocation: true },
          orderBy: { issuedAt: "desc" },
        },
      },
    });

    if (!customer) { sendError(res, "Customer not found", 404); return; }
    sendSuccess(res, customer);
  } catch (err) {
    console.error("[issuer.getCustomerDetail]", err);
    sendServerError(res);
  }
}

// GET /api/issuer/credentials
export async function getIssuedCredentials(req: Request, res: Response): Promise<void> {
  try {
    const issuerId = req.user?.userId;
    if (!issuerId) { sendError(res, "Not authenticated", 401); return; }

    const institution = await prisma.institutionProfile.findUnique({ where: { userId: issuerId } });
    if (!institution) { sendError(res, "Institution not found", 404); return; }

    const credentials = await prisma.credential.findMany({
      where: { issuerId: institution.id },
      include: {
        customer: { include: { user: { select: { name: true } } } },
        blockchainRecord: true,
        revocation: true,
      },
      orderBy: { issuedAt: "desc" },
    });

    sendSuccess(res, credentials);
  } catch (err) {
    console.error("[issuer.getIssuedCredentials]", err);
    sendServerError(res);
  }
}

// GET /api/issuer/activity
export async function getIssuerActivity(req: Request, res: Response): Promise<void> {
  try {
    const issuerId = req.user?.userId;
    if (!issuerId) { sendError(res, "Not authenticated", 401); return; }

    const institution = await prisma.institutionProfile.findUnique({ where: { userId: issuerId } });
    if (!institution) { sendError(res, "Institution not found", 404); return; }

    const [recentIssued, recentRevocations] = await Promise.all([
      prisma.credential.findMany({
        where: { issuerId: institution.id },
        take: 10,
        orderBy: { issuedAt: "desc" },
        include: { customer: { include: { user: { select: { name: true } } } } },
      }),
      prisma.revocation.findMany({
        where: { credential: { issuerId: institution.id } },
        take: 10,
        orderBy: { revokedAt: "desc" },
        include: { credential: { select: { credentialId: true } } },
      }),
    ]);

    sendSuccess(res, { recentIssued, recentRevocations });
  } catch (err) {
    console.error("[issuer.getActivity]", err);
    sendServerError(res);
  }
}
