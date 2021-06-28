const express = require("express");
const router = express.Router();
const passport = require("passport");
const { catchAsyncErr, isLoggedIn } = require("../middleware/middleware");

const users = require("../controllers/users");


// -------------------------------- User Routes -------------------------------------------------------- //

router.route("/register")
  .get(users.register)
  .post(catchAsyncErr(users.registerSubmit));

router.route("/login")
  .get(users.renderLogin)
  .post(passport.authenticate("local", { failureFlash: true, failureRedirect: "/login"}), users.loginSubmit);

router.get("/logout", isLoggedIn, users.logout)

module.exports = router;