const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const moment = require("moment");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

const userSchema = new mongoose.Schema({
  uid: String,
  name: String,
  score: Number,
  country: String,
  timestamp: String,
});

const User = mongoose.model("User", userSchema);

// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://rishabhmajithiya09:blacklight@cluster0.oyoebux.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1);
  });

app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findOne({ uid: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Count users with a higher score than the current user
    var rank = await User.countDocuments({ score: { $gt: user.score } });
    rank = rank+1;
    res.json({ rank });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/leaderboard/:countryCode", async (req, res) => {
  try {
    const countryCode = req.params.countryCode;
    console.log(countryCode);

    const oneWeekAgo = moment().subtract(7, "days").format();

    const topUsers = await User.find({
      country: countryCode,
      timestamp: { $gte: oneWeekAgo },
    })
      .sort({ score: -1 }) // Sort by score in descending order
      .limit(200); // Limit to top 200 users

    res.json(topUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/leaderboard", async (req, res) => {
  try {
    const leaderboard = await User.find().sort({ score: -1 }).limit(200);
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
