import { Request, Response, NextFunction } from "express";
import { sendForbidden } from "../utils/response.js";

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendForbidden(res, "Not authenticated");
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendForbidden(
        res,
        `Access denied. Required roles: ${roles.join(", ")}`
      );
      return;
    }

    next();
  };
}

// Convenience role guards
export const requireCustomer = requireRole("CUSTOMER");
export const requireIssuer = requireRole("ISSUER");
export const requireVerifier = requireRole("VERIFIER");
export const requireAdmin = requireRole("ADMIN");
export const requireIssuerOrAdmin = requireRole("ISSUER", "ADMIN");
export const requireVerifierOrAdmin = requireRole("VERIFIER", "ADMIN");
