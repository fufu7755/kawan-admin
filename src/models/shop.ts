import mongoose from "mongoose";
import { Content } from "next/font/google";

const ShopSchema = new mongoose.Schema({
  name: String,
  logo: String,
  pic: String,
  content: String,
  imgs: [{
    width: Number,
    height: Number,
    url: String,
    desc: String,
  }],
  address: String,
  phone: String,
  email: String,
  booking: String,
  menu: String,
  lunch: String,
  drink: String,
  kid: String,
});

const Shop = mongoose.models.Shops || mongoose.model('Shops', ShopSchema);

export default Shop;