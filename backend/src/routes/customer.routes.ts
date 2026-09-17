import { Router } from "express";
import {
  getMyProfile,
  getCustomerById,
  getCustomerIdentity,
  getCustomerCredentials,
  getCustomerHistory,
} from "../controllers/customer.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// All customer routes require authentication
router.use(authenticate);

// GET /api/customers/me
router.get("/me", getMyProfile);

// GET /api/customers/:id
router.get("/:id", getCustomerById);

// GET /api/customers/:id/identity
router.get("/:id/identity", getCustomerIdentity);

// GET /api/customers/:id/credentials
router.get("/:id/credentials", getCustomerCredentials);

// GET /api/customers/:id/history
router.get("/:id/history", getCustomerHistory);

export default router;
