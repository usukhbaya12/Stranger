import mongoose from "mongoose";
const Schema = mongoose.Schema;

const albumSchema = new Schema({
  name: {
    type: String,
  },
  artist: {
    type: String,
  },
  _id: {
    type: String,
    unique: true,
  },
  released: Date,
  image: {
    type: String,
  },
  label: {
    type: String,
  },
  total_tracks: {
    type: Number,
  },
  reviews: [
    {
      username: String,
      title: String,
      comment: String,
      rating: Number,
      date: { type: Date, default: Date.now },
      liked: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
      disliked: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
    },
  ],
});

const Albums = mongoose.models.Albums || mongoose.model("Albums", albumSchema);

export default Albums;
