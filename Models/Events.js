const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required for the Event"],
  },
  description: {
    type: String,
    required: [true, "Description is required for the Event"],
  },
  date: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  // organizers: [
  //   {
  //     type: Schema.User.ObjectId,
  //     ref: "User",
  //   },
  // ],
  thumbnail: {
    type: String,
    required: true,
  },
});

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
