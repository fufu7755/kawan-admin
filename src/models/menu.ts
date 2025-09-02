import { link } from "fs";
import mongoose from "mongoose";

const menuSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  chinese_name: {
    type: String,
  },
  price: {
    type: Number,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'categories',
  },
});

const Menu = mongoose.models.menus || mongoose.model('menus', menuSchema);

export default Menu;