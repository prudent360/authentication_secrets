//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const ejs = require("ejs");
const PORT = 3000;
const app = express();

// App use
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

//App Set
app.set("view engine", "ejs");

//Mongoose connection
mongoose.connect("mongodb://localhost:27017/UserDB", { useNewUrlParser: true });

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

// plugin for passport-local-mongoose
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// The Homepage Route
app.get("/", (req, res) => {
  res.render("home");
});

// The register Route
app.get("/register", (req, res) => {
  res.render("register");
});

// The Login Route
app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/secrets", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

//register Post route
app.post("/register", (req, res) => {
  User.register(
    { username: req.body.username },
    req.body.password,
    (err, user) => {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/secrets");
        });
      }
    }
  );
});

//Login Post Route
app.post("/login", (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets");
      });
    }
  });
});

app.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      return(err);
    }
    res.redirect("/");
  });
});

app.listen(PORT, (err, response) => {
  if (err) {
    console.log("Error Connectiing to Server");
  } else {
    console.log(`Connected to Port ${PORT}`);
  }
});
