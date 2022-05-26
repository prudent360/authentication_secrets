//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const encrypt = require('mongoose-encryption');
const PORT = 3000;
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

//Mongoose connection
mongoose.connect("mongodb://localhost:27017/UserDB", { useNewUrlParser: true });

const userSchema = new mongoose.Schema ({
  email: String,
  password: String,
});

const secret = "Thisisourlittlesecret."
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });

const User = new mongoose.model("User", userSchema);


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

//register Post route
app.post("/register", (req, res) => {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password,
  });

  newUser.save((err) => {
    if (err) {
      console.log(err);
    } else {
      res.render("secrets");
    }
  });
});

//Login Post Route
app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email: username}, (err, foundUser) => {
        if(err){
            console.log(err);
        } else {
            if(foundUser){
                if(foundUser.password === password){
                    res.render("secrets")
                }
            }
        }
    })
})

app.listen(PORT, (err, response) => {
  if (err) {
    console.log("Error Connectiing to Server");
  } else {
    console.log(`Connect to Port ${PORT}`);
  }
});
