import { Request, Response, NextFunction } from "express";
import * as sellerService from "../services/seller.service";
import {
  CreateSellerInput,
  UpdateSellerInput,
  ListSellersQuery,
} from "../validators/seller.validator";
import { ApiResponse } from "../types";

export const list = async (
  req: Request<
    Record<string, never>,
    ApiResponse,
    Record<string, never>,
    ListSellersQuery
  >,
  res: Response<ApiResponse>,
  next: NextFunction,
): Promise<void> => {
  try {
    const data = await sellerService.listSellers(req.query);
    res.json({ success: true, message: "Sellers retrieved.", data });
  } catch (err) {
    next(err);
  }
};

export const getOne = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse>,
  next: NextFunction,
): Promise<void> => {
  try {
    const seller = await sellerService.getSellerById(req.params.id);
    res.json({ success: true, message: "Seller retrieved.", data: { seller } });
  } catch (err) {
    next(err);
  }
};

export const create = async (
  req: Request<Record<string, never>, ApiResponse, CreateSellerInput>,
  res: Response<ApiResponse>,
  next: NextFunction,
): Promise<void> => {
  try {
    const seller = await sellerService.createSeller(req.body);
    res
      .status(201)
      .json({ success: true, message: "Seller created.", data: { seller } });
  } catch (err) {
    next(err);
  }
};

export const update = async (
  req: Request<{ id: string }, ApiResponse, UpdateSellerInput>,
  res: Response<ApiResponse>,
  next: NextFunction,
): Promise<void> => {
  try {
    const seller = await sellerService.updateSeller(req.params.id, req.body);
    res.json({ success: true, message: "Seller updated.", data: { seller } });
  } catch (err) {
    next(err);
  }
};

export const remove = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse>,
  next: NextFunction,
): Promise<void> => {
  try {
    await sellerService.deleteSeller(req.params.id);
    res.json({ success: true, message: "Seller deleted." });
  } catch (err) {
    next(err);
  }
};
