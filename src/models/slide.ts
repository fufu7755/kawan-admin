import mongoose from "mongoose";

const slideSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  img: String,
  desc: String,
});

const Slide = mongoose.models.slides || mongoose.model('slides', slideSchema);

export default Slide;