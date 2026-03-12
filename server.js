require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const activityRoutes = require("./routes/activity");

const configRoutes = require("./routes/config");
const authRoutes = require("./routes/auth");



const app = express();


/* ===============================
   TRUST PROXY (IMPORTANT FOR RENDER)
================================= */

app.set("trust proxy", 1);

/* ===============================
   MIDDLEWARE
================================= */

// CORS
app.use(cors({
  origin: "https://defyn-frontend.vercel.app",
  credentials: true
}));

app.use(express.json());

// SESSION
app.use(session({
  name: "defyn.sid",
  secret: process.env.SESSION_SECRET || "super_secret_key",
  resave: false,
  saveUninitialized: false,
  proxy: true,
  rolling: true,
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/"
  }
}));

/* ===============================
   ROUTES
================================= */

app.use("/config", configRoutes);
app.use("/auth", authRoutes);
app.use("/activity", activityRoutes);
app.use("/top-channels", require("./routes/topChannels"));
app.use("/top-users", require("./routes/topUsers"));
app.use("/growth", require("./routes/growth"));
app.use("/insights", require("./routes/insights"));
app.use("/bot", require("./routes/bot"));

// Root
app.get("/", (req, res) => {
  res.json({
    message: "Defyn Backend API running",
    env: process.env.NODE_ENV
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
