import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const SALT_WORK_FACTOR = 10

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
  },
  password: {
    type: String,
  },
  hashed_password: String,
  email: {
    type: String,
    unique: true,
  },
  phone: {  
    type: String,
    unique: true,
  },
  code: {
    type: String,
  },
  role: String,
  loginAttempts: {
    type: Number,
    required: true,
    default: 0
  },
  lockUntil: Number,
  status: {
    type: Boolean,
    default: false, // 默认未激活
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  updatedAt: {
    type: Date,
    default: new Date(),
  },
});

userSchema.pre("save", function (next) {
  if (this.isNew) {
    this.createdAt = this.updatedAt = new Date();
    this.status = true;
  } else {
    this.updatedAt = new Date();
  }
  next();
})

userSchema.pre('save', function (next) {
  let user = this
  if (!user.isModified('password')) return next()
  bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    if (err) return next(err)
    bcrypt.hash(user.password as string, salt, (error, hash) => {
      if (error) return next(error)
      user.password = hash
      next()
    })
  })
})

userSchema.methods = {
  comparePassword: async function (_password : string, password : string) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(_password, password, function (err, isMatch) {
        if (!err) resolve(isMatch)
        else reject(err)
      })
    }).catch((err) => {
      console.error(err)
    })
  },

}

const User = mongoose.models.users || mongoose.model('users', userSchema);

export default User;