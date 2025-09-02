import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  video: {
    type: String,
  },
  policy: String,
  img: [String],
  menu: String,
  deliveroo: String,
  booking: String,
  type: String,
  imgs: [{
    url: String,
    desc: String,
    width: Number,
    height: Number,
  }],
  hours: String,
  location: String,
  contact: String,
  menu_pic: String,
  menu_icon: String,
  deliveroo_pic: String,
  deliveroo_icon: String,
});

const Product = mongoose.models.products || mongoose.model('products', productSchema);

export default Product;