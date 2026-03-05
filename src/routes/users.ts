import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { getMe } from "../controllers/user.controller";

const router = Router();

router.use(authenticate);
router.get("/me", getMe);

export default router;
