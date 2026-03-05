import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { authorize, authorizeSeller } from "../middleware/authorize";
import { validate } from "../middleware/validate";
import {
  createSellerSchema,
  updateSellerSchema,
  listSellersQuerySchema,
} from "../validators/seller.validator";
import {
  list,
  getOne,
  create,
  update,
  remove,
} from "../controllers/seller.controller";

const router = Router();

router.get("/", validate(listSellersQuerySchema, "query"), list);
router.get("/:id", getOne);

router.post(
  "/",
  authenticate,
  authorize("admin"),
  validate(createSellerSchema),
  create,
);
router.delete("/:id", authenticate, authorize("admin"), remove);

router.patch(
  "/:id",
  authenticate,
  authorizeSeller,
  validate(updateSellerSchema),
  update,
);

export default router;
