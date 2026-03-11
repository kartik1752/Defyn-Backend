const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true
  },
  
  channelId: {
    type: String,
    required: true
  },

  userId: {
    type: String,
    required: true
  },

  date: {
    type: String,
    required: true
  },

  hour: {
    type: Number,
    required: true
  },

  messages: {
    type: Number,
    default: 0
  }

});

module.exports = mongoose.model("Activity", activitySchema);