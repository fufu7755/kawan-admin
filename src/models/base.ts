import mongoose from "mongoose";
import { ST } from "next/dist/shared/lib/utils";

const BaseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  key: String,
  desc: String,
  logo: String,
  content: String,
  facebook: String,
  instagram: String,
  xhs: String,
  tiktok: String,
  story: String,
  hours: String,
  locations: String,
  contact: String,
  video: String,
  terms: String,
  policy: String,
  cookie: String,
  menu: String,
  background_img: String,
  collect: String,
  book: String,
  order: String,
  address: String,
  phone: String,
  email: String,
});

const Base = mongoose.models.base || mongoose.model('base', BaseSchema);

export default Base;