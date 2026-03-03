const mongoose = require("mongoose");

const guildConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },

  antiSpam: { type: Boolean, default: false },
  antiRaid: { type: Boolean, default: false },
  aiMod: { type: Boolean, default: false },
});

module.exports = mongoose.model("GuildConfig", guildConfigSchema);