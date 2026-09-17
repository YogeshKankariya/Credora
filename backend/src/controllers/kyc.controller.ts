import { Request, Response } from "express";
import prisma from "../config/database.js";
import { sendSuccess, sendError, sendServerError } from "../utils/response.js";
import { param } from "../utils/params.js";

// GET /api/kyc/pending
export async function getPendingKYC(_req: Request, res: Response): Promise<void> {
  try {
    const pending = await prisma.customerProfile.findMany({
      where: { kycStatus: "PENDING" },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "asc" },
    });
    sendSuccess(res, pending);
  } catch (err) {
    console.error("[kyc.getPending]", err);
    sendServerError(res);
  }
}

// GET /api/kyc/:customerId
export async function getKYCStatus(req: Request, res: Response): Promise<void> {
  try {
    const customerId = param(req, "customerId");
    const customer = await prisma.customerProfile.findUnique({
      where: { id: customerId },
      select: {
        id: true, kycStatus: true, identityStatus: true, keyStatus: true,
        did: true, documentType: true, createdAt: true, updatedAt: true,
        user: { select: { name: true, email: true } },
      },
    });

    if (!customer) { sendError(res, "Customer not found", 404); return; }
    sendSuccess(res, customer);
  } catch (err) {
    console.error("[kyc.getStatus]", err);
    sendServerError(res);
  }
}

// POST /api/kyc/:customerId/approve
export async function approveKYC(req: Request, res: Response): Promise<void> {
  try {
    const customerId = param(req, "customerId");

    const customer = await prisma.customerProfile.findUnique({
      where: { id: customerId },
    });

    if (!customer) { sendError(res, "Customer not found", 404); return; }
    if (customer.kycStatus === "VERIFIED") {
      sendError(res, "Customer KYC is already verified", 400);
      return;
    }

    const updated = await prisma.customerProfile.update({
      where: { id: customerId },
      data: { kycStatus: "VERIFIED", identityStatus: "VERIFIED", updatedAt: new Date() },
    });

    sendSuccess(res, updated, "KYC approved successfully");
  } catch (err) {
    console.error("[kyc.approve]", err);
    sendServerError(res);
  }
}

// POST /api/kyc/:customerId/reject
export async function rejectKYC(req: Request, res: Response): Promise<void> {
  try {
    const customerId = param(req, "customerId");
    const { reason } = req.body as { reason?: string };

    const customer = await prisma.customerProfile.findUnique({
      where: { id: customerId },
    });

    if (!customer) { sendError(res, "Customer not found", 404); return; }

    const updated = await prisma.customerProfile.update({
      where: { id: customerId },
      data: { kycStatus: "REJECTED", updatedAt: new Date() },
    });

    sendSuccess(res, { ...updated, reason }, "KYC rejected");
  } catch (err) {
    console.error("[kyc.reject]", err);
    sendServerError(res);
  }
}
