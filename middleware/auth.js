const { User } = require("../models/User");

let auth = (req, res, next) => {
  let token = req.cookies.x_auth;

  try {
    User.findByToken(token, (err, user) => {
      req.token = token;
      req.user = user;
      next();
    });
  } catch (error) {
    console.error(error);
    res.status(401).send("Unauthorized");
  }
};

module.exports = { auth };
