import { Request, Response } from "express";
import prisma from "../config/database.js";
import { sendSuccess, sendError, sendServerError } from "../utils/response.js";
import { param } from "../utils/params.js";

// GET /api/customers/me
export async function getMyProfile(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) { sendError(res, "Not authenticated", 401); return; }

    const customer = await prisma.customerProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { name: true, email: true } },
        credentials: {
          where: { status: "ACTIVE" },
          orderBy: { issuedAt: "desc" },
          take: 1,
        },
      },
    });

    if (!customer) { sendError(res, "Customer profile not found", 404); return; }
    sendSuccess(res, customer);
  } catch (err) {
    console.error("[customer.getMyProfile]", err);
    sendServerError(res);
  }
}

// GET /api/customers/:id
export async function getCustomerById(req: Request, res: Response): Promise<void> {
  try {
    const id = param(req, "id");
    const customer = await prisma.customerProfile.findUnique({
      where: { id },
      include: { user: { select: { name: true, email: true } } },
    });

    if (!customer) { sendError(res, "Customer not found", 404); return; }
    sendSuccess(res, customer);
  } catch (err) {
    console.error("[customer.getCustomerById]", err);
    sendServerError(res);
  }
}

// GET /api/customers/:id/identity
export async function getCustomerIdentity(req: Request, res: Response): Promise<void> {
  try {
    const id = param(req, "id");
    const customer = await prisma.customerProfile.findUnique({
      where: { id },
      select: {
        id: true, did: true, publicKey: true, identityStatus: true,
        kycStatus: true, keyStatus: true, createdAt: true,
        user: { select: { name: true } },
      },
    });

    if (!customer) { sendError(res, "Customer not found", 404); return; }
    sendSuccess(res, customer);
  } catch (err) {
    console.error("[customer.getCustomerIdentity]", err);
    sendServerError(res);
  }
}

// GET /api/customers/:id/credentials
export async function getCustomerCredentials(req: Request, res: Response): Promise<void> {
  try {
    const id = param(req, "id");
    const credentials = await prisma.credential.findMany({
      where: { customerId: id },
      include: {
        issuer: { select: { name: true, did: true } },
        blockchainRecord: true,
        revocation: true,
      },
      orderBy: { issuedAt: "desc" },
    });

    sendSuccess(res, credentials);
  } catch (err) {
    console.error("[customer.getCustomerCredentials]", err);
    sendServerError(res);
  }
}

// GET /api/customers/:id/history
export async function getCustomerHistory(req: Request, res: Response): Promise<void> {
  try {
    const id = param(req, "id");

    const logs = await prisma.verificationLog.findMany({
      where: { credential: { customerId: id } },
      include: {
        credential: { select: { credentialId: true, credentialType: true } },
        verifier: { select: { name: true } },
      },
      orderBy: { verifiedAt: "desc" },
    });

    sendSuccess(res, logs);
  } catch (err) {
    console.error("[customer.getCustomerHistory]", err);
    sendServerError(res);
  }
}
