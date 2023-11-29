import mongoose from "mongoose";
const Schema = mongoose.Schema;

const artistSchema = new Schema({
  name: {
    type: String,
  },
  popularity: {
    type: Number,
  },
  _id: {
    type: String,
    unique: true,
  },
  genres: [],
  image: {
    type: String,
  },
  followers: {
    type: Number,
  },
  starred: [{ type: String }],
});

const Artists =
  mongoose.models.Artists || mongoose.model("Artists", artistSchema);

export default Artists;
