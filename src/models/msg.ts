import { link } from "fs";
import mongoose from "mongoose";

const msgSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// 保存前的钩子函数 保存前执行
msgSchema.pre('save', function (next) {
  // this 指向当前的文档
  this.createdAt = new Date();
  next();
});

const Msg = mongoose.models.msgs || mongoose.model('msgs', msgSchema);

export default Msg;