/**
 * KYCService
 *
 * Business logic for KYC review workflow.
 * Issuer reviews a customer's submitted documents and approves/rejects.
 */

import prisma from "../config/database.js";

export async function getPendingApplications() {
  return prisma.customerProfile.findMany({
    where: { kycStatus: "PENDING" },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });
}

export async function approveCustomerKYC(customerId: string) {
  return prisma.customerProfile.update({
    where: { id: customerId },
    data: {
      kycStatus: "VERIFIED",
      identityStatus: "VERIFIED",
      updatedAt: new Date(),
    },
  });
}

export async function rejectCustomerKYC(customerId: string) {
  return prisma.customerProfile.update({
    where: { id: customerId },
    data: { kycStatus: "REJECTED", updatedAt: new Date() },
  });
}

export const kycService = {
  getPendingApplications,
  approveCustomerKYC,
  rejectCustomerKYC,
};

export default kycService;
