const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["admin", "faculty", "student"],
    default: "student"
  },
  studentClass: {
    type: Number,
    enum: [6, 7, 8, 9, 10, null],
    default: null
  },
  section: {
    type: String,
    enum: ["A", "B", "C", null],
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
