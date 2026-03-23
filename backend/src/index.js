import express from "express"
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import cors from "cors"
dotenv.config()
import { connectDB } from "./libs/db.js"
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





const app=express()

const port=process.env.PORT

// to accept json data
app.use(express.json())


// to have cookie realted data
app.use(cookieParser())

app.use(express.urlencoded({extended:true})) 
 
// connecting to cors
app.use(cors({
  origin: "http://localhost:5173", // your Vite frontend
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


app.use("/api", chatRoutes);

// for get key
app.get("/api/getkey",(req,res)=>{
    res.status(200).json({key : process.env.RAZORPAY_KEY_ID})
})

// updated part for live location

connectDB()

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Buyer joins specific order room
  socket.on("joinOrderRoom", (orderId) => {
    socket.join(orderId);
    console.log("Joined order room:", orderId);
  });

  // Delivery agent sends location
  socket.on("updateLocation", ({ orderId, lat, lng }) => {
    io.to(orderId).emit("locationUpdated", { lat, lng });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(port, () => {
  console.log(`Server running on ${port}`);
});