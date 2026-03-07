const express = require("express");
const router = express.Router();
const axios = require("axios");

// 🔗 LOGIN
router.get("/login", (req, res) => {
  const redirect = `https://discord.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}&response_type=code&scope=identify%20guilds`;
  res.redirect(redirect);
});

// 🔁 CALLBACK
router.get("/callback", async (req, res) => {
  const code = req.query.code;

  try {
    const tokenRes = await axios.post(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.REDIRECT_URI,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const access_token = tokenRes.data.access_token;

    // Store token in session
    req.session.access_token = access_token;
    
    // Force session save and then redirect
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.send("❌ Session error");
      }
      
      // Set explicit cookie headers for mobile
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Origin', 'https://defyn-frontend.vercel.app');
      
      // Redirect to frontend with success flag
      res.redirect("https://defyn-frontend.vercel.app/dashboard?login=success");
    });

  } catch (err) {
    console.error("OAuth error:", err.response?.data || err.message);
    res.send("❌ Auth failed");
  }
});

// 🔐 GET USER
router.get("/user", async (req, res) => {
  console.log("Session in /user:", !!req.session?.access_token); // Debug log
  
  if (!req.session?.access_token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const userRes = await axios.get(
      "https://discord.com/api/users/@me",
      {
        headers: {
          Authorization: `Bearer ${req.session.access_token}`,
        },
      }
    );
    res.json(userRes.data);
  } catch (err) {
    console.error("User fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// 🔐 GET GUILDS
router.get("/guilds", async (req, res) => {
  if (!req.session?.access_token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const guildsRes = await axios.get(
      "https://discord.com/api/users/@me/guilds",
      {
        headers: {
          Authorization: `Bearer ${req.session.access_token}`,
        },
      }
    );

    // Filter admin servers only
    const adminGuilds = guildsRes.data.filter(
      g => (g.permissions & 0x8) === 0x8
    );

    res.json(adminGuilds);
  } catch (err) {
    console.error("Guilds fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch guilds" });
  }
});

// 🔓 LOGOUT
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.clearCookie('defyn.sid', { domain: '.onrender.com', path: '/' });
    res.json({ message: "Logged out" });
  });
});

module.exports = router;