import mongoose from "mongoose";

const subSchema = new mongoose.Schema({
  email: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

const Sub = mongoose.models.subs || mongoose.model('subs', subSchema);

export default Sub;