const { User } = require("../models/User");

let auth = async (req, res, next) => {
  let token = req.cookies.x_auth;
  try {
    User.schema.methods.findByToken(token, function (err, user) {
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
