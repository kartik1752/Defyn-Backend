require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");

const configRoutes = require("./routes/config");
const authRoutes = require("./routes/auth");

const app = express();

/* ===============================
   TRUST PROXY (CRITICAL FOR RENDER)
================================= */
app.set("trust proxy", 1); // Trust first proxy (Render)

/* ===============================
   MIDDLEWARE
================================= */

// CORS - Allow credentials and specific origin
app.use(cors({
  origin: "https://defyn-frontend.vercel.app",
  credentials: true,
  exposedHeaders: ['set-cookie'] // Important for mobile
}));

app.use(express.json());

// SESSION - Optimized for mobile
app.use(session({
  name: "defyn.sid", // Custom name helps with debugging
  secret: process.env.SESSION_SECRET || "super_secret_key",
  resave: false,
  saveUninitialized: false,
  proxy: true, // Trust proxy for secure cookies
  cookie: {
    httpOnly: true,
    secure: true, // Must be true for SameSite=None
    sameSite: "none", // Required for cross-site requests
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    domain: ".onrender.com" // Optional: helps with subdomains
  }
}));

/* ===============================
   ROUTES
================================= */

app.use("/config", configRoutes);
app.use("/auth", authRoutes);

// Root
app.get("/", (req, res) => {
  res.json({
    message: "Defyn Backend API running",
    env: process.env.NODE_ENV,
    session: !!req.session?.access_token // Debug
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    session: !!req.session?.access_token
  });
});

/* ===============================
   DATABASE
================================= */

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 30000
    });
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1);
  }
};

connectDB();

/* ===============================
   ERROR HANDLING
================================= */

app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(500).json({
    error: "Server Error",
    message: err.message
  });
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

/* ===============================
   START SERVER
================================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});