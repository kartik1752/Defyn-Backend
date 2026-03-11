const express = require("express");
const router = express.Router();
const Activity = require("../models/Activity");

router.get("/:guildId", async (req, res) => {

  const guildId = req.params.guildId;

  const users = await Activity.aggregate([
    { $match: { guildId } },
    {
      $group: {
        _id: "$userId",
        messages: { $sum: 1 }
      }
    },
    { $sort: { messages: -1 } },
    { $limit: 5 }
  ]);

  res.json(users);

});

module.exports = router;