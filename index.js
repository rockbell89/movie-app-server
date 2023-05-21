require("dotenv").config();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const port = 5000;
const cors = require("cors");
const { User } = require("./models/User");
const { auth } = require("./middleware/auth");

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

// cors
// app.use(cors());
app.use(
  cors({
    origin: ["http://127.0.0.1:5173", "https://rockbell89.github.io"],
    credentials: true,
  })
);

// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// aaplication/json
app.use(bodyParser.json());
app.use(cookieParser());

app.use("/api/users", require("./routes/users"));

app.listen(port, () => console.log(`Example app listening on port ${port}`));
