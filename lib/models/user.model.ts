import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  image: String,
  name: String,
  bio: String,
  thrends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Thrend",
    },
  ],
  onboarded: {
    type: Boolean,
    default: false,
  },
  communities: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
    },
  ],
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
