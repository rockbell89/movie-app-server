require("dotenv").config();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const port = 5000;
const { User } = require("./models/User");
const { auth } = require("./middleware/auth");

// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// aaplication/json
app.use(bodyParser.json());
app.use(cookieParser());

/**
 * mongoose - mongoDB 기반의 ODM 라이브러리로 데이터베이스를 더 쉽게 다루게 해줌
 * 1. schema를 이용한 데이터 모델 정의
 * 2. schema 데이터를 object객체로 다룰 수 있음
 * 3. CRUD 연산수행
 * 4. 데이터 검증 및 트랜잭션 처리등 다양한 기능 제공
 */
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_DB_URL).then(() => {
  console.log("Connected....");
});

app.get("/", (req, res) => res.send("Hello World!"));
app.post("/api/users/register", async (req, res) => {
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

app.post("/api/users/login", async (req, res) => {
  console.log(req.body);
  try {
    const user = await User.findOne({ email: req.body.email });
    console.log(user);
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "해당하는 이메일의 유저가 없습니다",
      });
    }
    await user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch) {
        return res.json({
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

app.get("/api/users/auth", auth, (req, res) => {
  res.status(200).json({
    isAuth: true,
    _id: req.user._id,
    email: req.user.email,
    isAdmin: req.user.role === 0 ? false : true,
  });
});

app.post("/api/users/logout", auth, async (req, res) => {
  try {
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

app.listen(port, () => console.log(`Example app listening on port ${port}`));
