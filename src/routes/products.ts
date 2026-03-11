import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/authorize";
import { validate } from "../middleware/validate";
import {
  createProductSchema,
  updateProductSchema,
  addReviewSchema,
  listProductsQuerySchema,
} from "../validators/product.validator";
import {
  list,
  getOne,
  create,
  update,
  remove,
  addReview,
} from "../controllers/product.controller";

const router = Router();

// Public
router.get("/", validate(listProductsQuerySchema, "query"), list);
router.get("/:id", getOne);

// Seller: create their own products
router.post(
  "/",
  authenticate,
  authorize("seller"),
  validate(createProductSchema),
  create,
);

// Seller (own) or admin: update / delete
router.patch(
  "/:id",
  authenticate,
  authorize("seller", "admin"),
  validate(updateProductSchema),
  update,
);
router.delete(
  "/:id",
  authenticate,
  authorize("seller", "admin"),
  remove,
);

// Customer: add review
router.post(
  "/:id/reviews",
  authenticate,
  authorize("customer"),
  validate(addReviewSchema),
  addReview,
);

export default router;
