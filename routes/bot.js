const express = require("express");
const router = express.Router();

const GuildConfig = require("../models/GuildConfig");

// BOT CONFIG (no login required)
router.get("/config/:guildId", async (req, res) => {

  try {

    const config = await GuildConfig.findOne({
      guildId: req.params.guildId
    });

    if (!config) {
      return res.json({
        antiSpam: false,
        antiRaid: false,
        aiMod: false
      });
    }

    res.json(config);

  } catch (err) {

    console.error(err);
    res.status(500).json({
      antiSpam: false,
      antiRaid: false,
      aiMod: false
    });

  }

});

module.exports = router;