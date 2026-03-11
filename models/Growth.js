const mongoose = require("mongoose");

const growthSchema = new mongoose.Schema({

  guildId: String,
  date: String

});

module.exports = mongoose.model("Growth", growthSchema);