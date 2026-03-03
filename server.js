require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const dns = require('dns');
const configRoutes = require("./routes/config");
const authRoutes = require("./routes/auth");

// Force Node.js to use IPv4 and Google DNS
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();

// Middleware
app.use(cors({
  origin: "https://defyn-frontend.vercel.app",
  credentials: true
}));

app.use(express.json());

// Session setup
app.use(session({
  secret: "super_secret_key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Routes
app.use("/config", configRoutes);
app.use("/auth", authRoutes);

// MongoDB Connection with better options
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL || process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4
      directConnection: false,
    });
    console.log("✅ MongoDB Connected successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    console.error("❌ Check your MONGO_URI in .env file");
    
    // Try alternative connection approach
    console.log("🔄 Attempting alternative connection method...");
    tryAlternativeConnection();
  }
};

// Alternative connection method
const tryAlternativeConnection = async () => {
  try {
    // Get the connection string
    const uri = process.env.MONGO_URL || process.env.MONGO_URI;
    
    // Try to resolve the SRV record manually
    const { Resolver } = require('dns').promises;
    const resolver = new Resolver();
    resolver.setServers(['8.8.8.8', '8.8.4.4']);
    
    try {
      const srvRecords = await resolver.resolveSrv('_mongodb._tcp.cluster0.relbufb.mongodb.net');
      console.log('✅ SRV Records found:', srvRecords);
      
      // Connect using the resolved records
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 30000,
        family: 4,
        directConnection: false
      });
      console.log("✅ MongoDB Connected successfully via alternative method");
    } catch (srvError) {
      console.error("❌ SRV Resolution failed:", srvError.message);
      console.log("\n💡 Try this fix:");
      console.log("1. Go to MongoDB Atlas → Connect → Connect your application");
      console.log("2. Copy the 'standard connection string' (not SRV)");
      console.log("3. Replace your MONGO_URL in .env with that string");
    }
  } catch (err) {
    console.error("❌ Alternative connection failed:", err.message);
  }
};

connectDB();

module.exports = app;