require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");

const configRoutes = require("./routes/config");
const authRoutes = require("./routes/auth");

const app = express();

/* ===============================
   MIDDLEWARE
================================= */

// CORS
app.use(cors({
  origin: [
    "https://defyn-frontend.vercel.app",
    "http://localhost:3000"
  ],
  credentials: true
}));

app.use(express.json());

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || "super_secret_key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // true on Render
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000
  }
}));

/* ===============================
   ROUTES
================================= */

app.use("/config", configRoutes);
app.use("/auth", authRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Defyn Backend API is running",
    environment: process.env.NODE_ENV || "development"
  });
});

// Health check (important for Render)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString()
  });
});

/* ===============================
   DATABASE CONNECTION
================================= */

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URL) {
      console.error("❌ MONGO_URL is missing in environment variables");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 30000
    });

    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
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
    error: "Something went wrong!",
    message: err.message
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found"
  });
});

/* ===============================
   SERVER LISTEN (RENDER FIX)
================================= */

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;