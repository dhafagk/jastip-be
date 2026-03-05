import { Router, Request, Response } from "express";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "jastip-be API is running.",
    data: {
      version: "1.0.0",
      endpoints: {
        auth: {
          register: "POST /auth/register",
          login: "POST /auth/login",
        },
        users: {
          me: "GET /users/me  [requires Bearer token]",
        },
      },
    },
  });
});

export default router;
