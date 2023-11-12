import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    trim: true,
    required: "Userame is required",
  },
  email: {
    type: String,
    trim: true,
    unique: "Email already exists",
    match: [/.+\@.+\..+/, "Please fill a valid email address"],
    required: "Email is required",
  },
  password: {
    type: String,
    required: "Password is required",
  },
  updated: Date,
  created: {
    type: Date,
    default: Date.now,
  },
});

const Users = mongoose.models.Users || mongoose.model("Users", userSchema);

export default Users;
