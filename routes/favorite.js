require("dotenv").config();
const express = require("express");
const router = express.Router();
const { Favorite } = require("../models/Favorite");
const { auth } = require("../middleware/auth");

router.post("/favoriteCount", auth, async (req, res) => {
  try {
    const movieId = await Favorite.find({ movieId: req.body.movieId });
    if (!movieId) throw new Error("해당 Id 정보가 존재하지 않습니다");
    if (movieId) {
      res.status(200).json({
        success: true,
        count: movieId.length,
      });
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/favorited", auth, async (req, res) => {
  let result = false;
  try {
    const isFavorited = await Favorite.find({
      movieId: req.body.movieId,
      userFrom: req.body.userFrom,
    });

    if (isFavorited.length !== 0) {
      result = true;
    }

    res.status(200).json({
      success: true,
      isFavorited: result,
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/addToFavorite", auth, async (req, res) => {
  try {
    const favorite = new Favorite(req.body);
    const result = await favorite.save();
    if (result) {
      res.status(200).json({
        success: true,
        isFavorited: result,
      });
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/removeFromFavorite", auth, async (req, res) => {
  try {
    const result = await Favorite.findOneAndDelete({
      movieId: req.body.movieId,
      userFrom: req.body.userFrom,
    });

    if (result) {
      res.status(200).json({
        success: true,
        isFavorited: result,
      });
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
