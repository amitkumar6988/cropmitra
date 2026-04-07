import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";
import cropRoutes from "./routes/crop.routes.js";
import priceRoutes from "./routes/price.routes.js";
import marketDataRoutes from "./routes/marketData.routes.js";
import externalFactorRoutes from "./routes/externalFactor.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PRICE_API_PORT || 5050;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5174",
    ],
    credentials: true,
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "crop-price-prediction-api" });
});

app.use("/api/crops", cropRoutes);
app.use("/api/prices", priceRoutes);
app.use("/api/market-data", marketDataRoutes);
app.use("/api/external-factors", externalFactorRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const MONGO_URI =
  process.env.PRICE_MONGODB_URI ||
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/crop_price_prediction";

connectDB(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Crop price API listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });
