import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: "Userame is required",
  },
  email: {
    type: String,
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
  bio: {
    type: String,
    default: null,
  },
  name: {
    type: String,
    default: null,
  },
  image: {
    type: String,
    default: null,
  },
});

const Users = mongoose.models.Users || mongoose.model("Users", userSchema);

export default Users;
