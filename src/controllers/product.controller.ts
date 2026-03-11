import { Response, NextFunction } from "express";
import * as productService from "../services/product.service";
import {
  CreateProductInput,
  UpdateProductInput,
  AddReviewInput,
  ListProductsQuery,
} from "../validators/product.validator";
import { AuthRequest, ApiResponse, AppError } from "../types";

export const list = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = await productService.listProducts(
      req.query as ListProductsQuery,
    );
    res.json({ success: true, message: "Products retrieved.", data });
  } catch (err) {
    next(err);
  }
};

export const getOne = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction,
): Promise<void> => {
  try {
    const product = await productService.getProductById(req.params["id"] as string);
    res.json({ success: true, message: "Product retrieved.", data: { product } });
  } catch (err) {
    next(err);
  }
};

export const create = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction,
): Promise<void> => {
  try {
    const sellerId = req.user?.sellerId;
    if (!sellerId) {
      next(new AppError(403, "Forbidden. No seller profile linked to account."));
      return;
    }
    const product = await productService.createProduct(
      req.body as CreateProductInput,
      sellerId,
    );
    res
      .status(201)
      .json({ success: true, message: "Product created.", data: { product } });
  } catch (err) {
    next(err);
  }
};

export const update = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      next(new AppError(401, "Unauthorized."));
      return;
    }
    const product = await productService.updateProduct(
      req.params["id"] as string,
      req.body as UpdateProductInput,
      req.user.sellerId ?? req.user.id,
      req.user.role,
    );
    res.json({ success: true, message: "Product updated.", data: { product } });
  } catch (err) {
    next(err);
  }
};

export const remove = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      next(new AppError(401, "Unauthorized."));
      return;
    }
    await productService.deleteProduct(
      req.params["id"] as string,
      req.user.sellerId ?? req.user.id,
      req.user.role,
    );
    res.json({ success: true, message: "Product deleted." });
  } catch (err) {
    next(err);
  }
};

export const addReview = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      next(new AppError(401, "Unauthorized."));
      return;
    }
    const product = await productService.addReview(
      req.params["id"] as string,
      req.body as AddReviewInput,
      req.user.id,
    );
    res
      .status(201)
      .json({ success: true, message: "Review added.", data: { product } });
  } catch (err) {
    next(err);
  }
};
