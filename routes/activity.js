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

router.get("/:guildId", async (req, res) => {
  try {

    const { guildId } = req.params;

    const activity = await Activity.find({ guildId })
      .sort({ date: -1, hour: -1 })
      .limit(100);

    res.json(activity);

  } catch (err) {

    console.error("ACTIVITY FETCH ERROR:", err);

    res.status(500).json({
      error: "Failed to fetch activity"
    });

  }
});

module.exports = router;