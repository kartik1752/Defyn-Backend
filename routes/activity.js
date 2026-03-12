const express = require("express");
const router = express.Router();

const Activity = require("../models/Activity"); // import model

router.post("/", async (req, res) => {
  try {

    const { guildId, channelId, userId } = req.body;

    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const hour = now.getHours();

    let activity = await Activity.findOne({
      guildId,
      channelId,
      userId,
      date,
      hour
    });

    if (!activity) {

      activity = new Activity({
        guildId,
        channelId,
        userId,
        date,
        hour,
        messages: 1
      });

    } else {

      activity.messages += 1;

    }

    await activity.save();

    res.json({ success: true });

  } catch (err) {

    console.error("ACTIVITY ERROR:", err);
    res.status(500).json({
      error: "Activity update failed",
      details: err.message
    });

  }
});

module.exports = router;