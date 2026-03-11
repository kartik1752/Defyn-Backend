const express = require("express");
const router = express.Router();
const Activity = require("../models/Activity");

router.get("/:guildId", async (req, res) => {

  const { guildId } = req.params;

  const activity = await Activity.find({ guildId });

  if (!activity.length) {
    return res.json({
      insights: ["No activity data yet."]
    });
  }

  let total = 0;
  let channelMap = {};
  let userMap = {};
  let hourMap = {};

  activity.forEach(a => {

    total += a.messages || 0;

    channelMap[a.channelId] = (channelMap[a.channelId] || 0) + (a.messages || 0);
    userMap[a.userId] = (userMap[a.userId] || 0) + (a.messages || 0);
    hourMap[a.hour] = (hourMap[a.hour] || 0) + (a.messages || 0);

  });

  const topChannel = Object.keys(channelMap).sort((a,b)=>channelMap[b]-channelMap[a])[0];
  const topUser = Object.keys(userMap).sort((a,b)=>userMap[b]-userMap[a])[0];
  const peakHour = Object.keys(hourMap).sort((a,b)=>hourMap[b]-hourMap[a])[0];

  const insights = [
    `Most active channel: ${topChannel}`,
    `Most active user: ${topUser}`,
    `Peak activity hour: ${peakHour}:00`,
    `Total messages tracked: ${total}`
  ];

  res.json({ insights });

});

module.exports = router;