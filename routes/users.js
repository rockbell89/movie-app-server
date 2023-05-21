const express = require("express");
const router = express.Router();
const { User } = require("../models/User");
const { auth } = require("../middleware/auth");

router.post("/register", async (req, res) => {
  try {
    const user = new User(req.body);
    const userStatus = await user.save();

    if (!userStatus) {
      const err = new Error("실패");
      res.status(400).json({ success: fail, err });
    }
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).send(error);
    console.error(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "해당하는 이메일의 유저가 없습니다",
      });
    }

    await user.comparePassword(req.body.password, (err, isMatch) => {
      if (err) return res.status(400).send(err);
      if (!isMatch) {
        return res.status(401).json({
          loginSuccess: false,
          message: "비밀번호가 틀렸습니다",
        });
      }
      user.generateToken((err, user) => {
        if (err) {
          return res.status(400).send(err);
        }
        res
          .cookie("x_auth", user.token)
          .status(200)
          .json({ loginSuccess: true, userId: user._id });
      });
    });
  } catch (error) {
    res.status(500).send(error);
    console.error(error);
  }
});

router.get("/auth", auth, (req, res) => {
  res.status(200).json({
    isAuth: true,
    _id: req.user._id,
    email: req.user.email,
    isAdmin: req.user.role === 0 ? false : true,
  });
});

router.get("/logout", auth, async (req, res) => {
  try {
    console.log("req.user", req.user);
    const isUpdated = await User.findOneAndUpdate(
      { _id: req.user._id },
      { token: "" }
    );
    if (isUpdated) {
      return res.status(200).send({ success: true });
    }
  } catch (error) {
    return res.json({ success: false, error });
  }
});

module.exports = router;
