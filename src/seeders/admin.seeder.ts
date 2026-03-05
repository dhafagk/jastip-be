import "dotenv/config";
import "../config/env";
import mongoose from "mongoose";
import { env } from "../config/env";
import User from "../models/User";

const ADMIN_NAME = "Super Admin";
const ADMIN_EMAIL = "admin@jastip.com";
const ADMIN_PASSWORD = "Admin@123456";

const seed = async (): Promise<void> => {
  await mongoose.connect(env.mongoUri);

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log(`Admin already exists: ${ADMIN_EMAIL}`);
    await mongoose.disconnect();
    return;
  }

  await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: "admin",
  });

  console.log("Admin seeded successfully.");
  console.log(`  Email   : ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  console.log("Change the password after first login.");

  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error("Seeder failed:", err);
  process.exit(1);
});
