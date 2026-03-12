const express = require("express");
const router = express.Router();
const Activity = require("../models/Activity");


// POST → update activity
router.post("/", async (req, res) => {

  try {

    const { guildId, channelId, userId } = req.body;

    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const hour = now.getHours();

    let activity = await Activity.findOne({
      guildId,
      date,
      hour
    });

    if (!activity) {

      activity = new Activity({
        guildId,
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

    console.error(err);
    res.status(500).json({ error: "Activity update failed" });

  }

});


// GET → fetch activity data
router.get("/:guildId", async (req, res) => {

  try {

    const data = await Activity.find({
      guildId: req.params.guildId
    });

    res.json(data);

  } catch (err) {

    console.error(err);
    res.status(500).json({ error: "Failed to fetch activity" });

  }

});


module.exports = router;