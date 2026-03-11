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
          registerCustomer: "POST /auth/register/customer",
          registerSeller: "POST /auth/register/seller",
          registerAdmin:
            "POST /auth/register/admin  [requires admin Bearer token]",
          login: "POST /auth/login",
        },
        users: {
          me: "GET /users/me  [requires Bearer token]",
        },
        sellers: {
          list: "GET /sellers  [?city=&isVerified=&minRating=&page=&limit=]",
          getOne: "GET /sellers/:id",
          create: "POST /sellers  [requires Bearer token]",
          update: "PATCH /sellers/:id  [requires Bearer token]",
          delete: "DELETE /sellers/:id  [requires Bearer token]",
        },
        products: {
          list: "GET /products  [?category=&status=&sellerId=&originCity=&tag=&minPrice=&maxPrice=&isAvailableForOrder=&page=&limit=]",
          getOne: "GET /products/:id",
          create: "POST /products  [requires seller Bearer token]",
          update: "PATCH /products/:id  [requires seller/admin Bearer token]",
          delete: "DELETE /products/:id  [requires seller/admin Bearer token]",
          addReview: "POST /products/:id/reviews  [requires customer Bearer token]",
        },
      },
    },
  });
});

export default router;
