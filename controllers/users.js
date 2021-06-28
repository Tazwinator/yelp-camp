const express = require("express");
const User = require("../models/user");


module.exports.register =(req, res) => {
  res.render("users/register");
};

module.exports.registerSubmit = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username});
    const registeredUser = await User.register(user, password); // Passport's method for hashing and salting
    console.log(registeredUser); // ------------------- For show, delete when necessary
    req.login(registeredUser, err => {
      if (err) return next(err);
      req.flash("Welcome to Yelp Camp!");
      res.redirect("/campgrounds");
    })
  } catch(e) {
    req.flash("error", e.message);
    res.redirect("/register");
  }
};

module.exports.renderLogin = (req, res) => {
  res.render("users/login");
};

module.exports.loginSubmit = (req, res) => {
  req.flash("success", "Logged in, welcome!"); // Passed in to the next request
  const redirectUrl = req.session.returnTo || "/campgrounds"; // If returnTo is empty, /campgrounds with be used
  delete req.session.returnTo; // deletes the object so it doesn't hang around in the session
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
  req.logout();
  req.flash("success", "Logged out, goodbye!");
  res.redirect("/campgrounds")
};