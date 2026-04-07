import mongoose from "mongoose";

export async function connectDB(uri) {
  const conn = await mongoose.connect(uri);
  return conn;
}
