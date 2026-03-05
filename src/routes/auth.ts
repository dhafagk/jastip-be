import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/authorize";
import { validate } from "../middleware/validate";
import {
  customerRegisterSchema,
  sellerRegisterSchema,
  adminRegisterSchema,
  loginSchema,
} from "../validators/auth.validator";
import {
  registerCustomerHandler,
  registerSellerHandler,
  registerAdminHandler,
  login,
} from "../controllers/auth.controller";

const router = Router();

router.post(
  "/register/customer",
  validate(customerRegisterSchema),
  registerCustomerHandler,
);
router.post(
  "/register/seller",
  validate(sellerRegisterSchema),
  registerSellerHandler,
);
router.post(
  "/register/admin",
  authenticate,
  authorize("admin"),
  validate(adminRegisterSchema),
  registerAdminHandler,
);
router.post("/login", validate(loginSchema), login);

export default router;
