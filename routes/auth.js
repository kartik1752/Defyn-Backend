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

    // ✅ STORE TOKEN IN SESSION (SECURE)
    req.session.access_token = access_token;

    // ✅ REDIRECT TO FRONTEND DASHBOARD
    res.redirect("https://defyn-frontend.vercel.app/dashboard");

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.send("❌ Auth failed");
  }
});


// 🔐 GET USER
router.get("/user", async (req, res) => {
  if (!req.session.access_token) {
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
    res.status(500).json({ error: "Failed to fetch user" });
  }
});


// 🔐 GET GUILDS (ADMIN ONLY)
router.get("/guilds", async (req, res) => {
  if (!req.session.access_token) {
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

    // 🧠 FILTER ADMIN SERVERS ONLY
    const adminGuilds = guildsRes.data.filter(
      g => (g.permissions & 0x8) === 0x8
    );

    res.json(adminGuilds);

  } catch (err) {
    res.status(500).json({ error: "Failed to fetch guilds" });
  }
});


// 🔓 LOGOUT
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});

module.exports = router;