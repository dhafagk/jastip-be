import Seller from "../models/Seller";
import { AppError } from "../types";
import {
  CreateSellerInput,
  UpdateSellerInput,
  ListSellersQuery,
} from "../validators/seller.validator";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export const listSellers = async (query: ListSellersQuery) => {
  const filter: Record<string, unknown> = {};

  if (query.city) {
    filter["currentCity"] = { $regex: query.city, $options: "i" };
  }
  if (query.isVerified !== undefined) {
    filter["isVerified"] = query.isVerified === "true";
  }
  if (query.minRating !== undefined) {
    filter["rating"] = { $gte: parseFloat(query.minRating) };
  }

  const page = parseInt(query.page ?? "1", 10);
  const limit = Math.min(
    MAX_LIMIT,
    parseInt(query.limit ?? String(DEFAULT_LIMIT), 10),
  );
  const skip = (page - 1) * limit;

  const [sellers, total] = await Promise.all([
    Seller.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    Seller.countDocuments(filter),
  ]);

  return { sellers, total, page, limit };
};

export const getSellerById = async (id: string) => {
  const seller = await Seller.findById(id);
  if (!seller) throw new AppError(404, "Seller not found.");
  return seller;
};

export const createSeller = async (input: CreateSellerInput) => {
  return Seller.create(input);
};

export const updateSeller = async (id: string, input: UpdateSellerInput) => {
  const seller = await Seller.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  });
  if (!seller) throw new AppError(404, "Seller not found.");
  return seller;
};

export const deleteSeller = async (id: string) => {
  const seller = await Seller.findByIdAndDelete(id);
  if (!seller) throw new AppError(404, "Seller not found.");
};
