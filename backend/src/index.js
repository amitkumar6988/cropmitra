import express from "express"
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import cors from "cors"
dotenv.config()
import { connectDB } from "./libs/db.js"
import { connectDB as connectPriceDB } from "../../crop-price-prediction-module/backend/src/config/db.js"
import { errorHandler } from "./middleware/errorHandler.js"
import authRoutes from "./routes/auth.route.js"
import cropsRoutes from "./routes/crops.route.js"
import orderRoutes from "./routes/orders.route.js"
import analyticsRoutes from "./routes/analytics.route.js"
import farmerRoutes from "./routes/farmer.routes.js"
import cartRoutes from "./routes/cart.routes.js"
import adminRoutes from "./routes/admin.routes.js"
import addressRoutes from "./routes/address.routes.js";
import chatRoutes from "./routes/chatRoutes.js";
import paymentRoutes from "./routes/payment.routes.js"
import pricePredictionRoutes from "./routes/pricePrediction.routes.js"
import bidRoutes from "./routes/bid.routes.js"
import wishlistRoutes from "./routes/wishlist.routes.js"





const app=express()

const port=process.env.PORT

// to accept json data
app.use(express.json())


// to have cookie realted data
app.use(cookieParser())

app.use(express.urlencoded({extended:true})) 
 
// connecting to cors
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(",").map(origin => origin.trim())
  : [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/];

app.use(cors({
  origin: allowedOrigins,
  credentials: true, // allow cookies/tokens
}));

// how here we will set or end pioint

app.use("/api/auth",authRoutes)
app.use("/api/farmer",farmerRoutes)
app.use("/api/crops",cropsRoutes)
app.use("/api/cart", cartRoutes);

app.use("/api/orders",orderRoutes)
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/price-prediction", pricePredictionRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/wishlist", wishlistRoutes);


app.use("/api", chatRoutes);

// for get key
app.get("/api/getkey",(req,res)=>{
    res.status(200).json({key : process.env.RAZORPAY_KEY_ID})
})

// updated part for live location

connectDB()
connectPriceDB(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cropmitra").catch(err => console.error("Price DB connect error", err));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

io.on("connection", (socket) => {
  // Buyer joins specific order room
  socket.on("joinOrderRoom", (orderId) => {
    socket.join(orderId);
  });

  // Delivery agent sends location
  socket.on("updateLocation", ({ orderId, lat, lng }) => {
    io.to(orderId).emit("locationUpdated", { lat, lng });
  });

  socket.on("disconnect", () => {
    // Connection closed
  });
});

// Global error handler middleware
app.use(errorHandler);

server.listen(port, () => {
  if (process.env.NODE_ENV === "development") {
    console.log(`Server running on port ${port}`);
  }
});