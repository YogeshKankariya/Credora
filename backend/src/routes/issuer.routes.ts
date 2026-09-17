import { Router } from "express";
import {
  getIssuerDashboard,
  getIssuerCustomers,
  getIssuerCustomerDetail,
  getIssuedCredentials,
  getIssuerActivity,
} from "../controllers/issuer.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireIssuerOrAdmin } from "../middleware/role.middleware.js";

const router = Router();

router.use(authenticate, requireIssuerOrAdmin);

// GET /api/issuer/dashboard
router.get("/dashboard", getIssuerDashboard);

// GET /api/issuer/customers
router.get("/customers", getIssuerCustomers);

// GET /api/issuer/customers/:id
router.get("/customers/:id", getIssuerCustomerDetail);

// GET /api/issuer/credentials
router.get("/credentials", getIssuedCredentials);

// GET /api/issuer/activity
router.get("/activity", getIssuerActivity);

export default router;
