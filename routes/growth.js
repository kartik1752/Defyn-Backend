const express = require("express");
const router = express.Router();
const Growth = require("../models/Growth");

// Save join
router.post("/", async (req, res) => {

  const { guildId } = req.body;

  const today = new Date().toISOString().slice(0,10);

  await Growth.create({
    guildId,
    date: today
  });

  res.json({ success: true });

});


// Get growth stats
router.get("/:guildId", async (req, res) => {

  const { guildId } = req.params;

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);

  const week = await Growth.countDocuments({
    guildId,
    date: { $gte: weekAgo.toISOString().slice(0,10) }
  });

  const month = await Growth.countDocuments({
    guildId,
    date: { $gte: monthAgo.toISOString().slice(0,10) }
  });

  res.json({
    week,
    month
  });

});

module.exports = router;