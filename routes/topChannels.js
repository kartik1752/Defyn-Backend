const express = require("express");
const router = express.Router();
const Activity = require("../models/Activity");

router.get("/:guildId", async (req, res) => {

  const guildId = req.params.guildId;

  const channels = await Activity.aggregate([
    { $match: { guildId } },
    {
      $group: {
        _id: "$channelId",
        messages: { $sum: 1 }
      }
    },
    { $sort: { messages: -1 } },
    { $limit: 5 }
  ]);

  res.json(channels);

});

module.exports = router;