const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SALT_ROUNDS = 10;

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    minlength: 5,
  },
  lastname: {
    type: String,
    maxlength: 50,
  },
  role: {
    type: Number,
    default: 0, // 일반 : 0 , 관리자 : 1
  },
  image: String,
  token: { type: String },
  tokenExp: { type: Number },
});

userSchema.pre("save", function (next) {
  const user = this;
  if (!this.isModified("password")) return next();
  bcrypt.genSalt(SALT_ROUNDS, (err, salt) => {
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function (password, cb) {
  bcrypt.compare(password, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

userSchema.methods.generateToken = async function (cb) {
  const user = this;
  const token = jwt.sign(user._id.toHexString(), process.env.JWT_SECRET);
  user.token = token;

  try {
    await user.save();
    cb(null, user);
  } catch (err) {
    cb(err);
  }
};

userSchema.methods.findByToken = function (token, cb) {
  jwt.verify(token, process.env.JWT_SECRET, async function (err, payload) {
    try {
      const userInfo = await User.findOne({ _id: payload, token: token });
      cb(null, userInfo);
    } catch (err) {
      cb(err);
    }
  });
};

const User = mongoose.model("User", userSchema);

module.exports = { User };
