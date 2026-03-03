const express = require("express");
const router = express.Router();
const GuildConfig = require("../models/GuildConfig");

// 🔐 GET CONFIG
router.get("/:guildId", async (req, res) => {
  const { guildId } = req.params;

  if (!req.session.access_token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const config = await GuildConfig.findOne({ guildId });

    // 👉 If no config exists → return default
    if (!config) {
      return res.json({
        antiSpam: false,
        antiRaid: false,
        aiMod: false,
      });
    }

    res.json(config);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


// 💾 SAVE CONFIG
router.post("/:guildId", async (req, res) => {
  const { guildId } = req.params;

  if (!req.session.access_token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const updatedConfig = await GuildConfig.findOneAndUpdate(
      { guildId },
      { ...req.body, guildId },
      { upsert: true, new: true }
    );

    res.json({
      message: "✅ Config saved",
      config: updatedConfig,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save config" });
  }
});

module.exports = router;