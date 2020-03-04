const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  photo: {
    data: Buffer,
    contentType: String
  },
  postedBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User"
  },
  created: {
    type: Date,
    default: Date.now
  },
  updated: Date,
  likes: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  comments: [
    {
      text: String,
      created: { type: Date, default: Date.now },
      postedBy: { type: mongoose.Schema.ObjectId, ref: "User" }
    }
  ]
});

module.exports = mongoose.model("Post", postSchema);
