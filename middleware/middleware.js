const { campgroundSchema, reviewSchema }  = require("../schemas");
const Campground = require("../models/campground");
const Review = require("../models/review");

// This class bascially edits the Error class with the parameters passed in
class ExpressError extends Error { // Express Error is an extension of Error
  constructor(message, statusCode) { // These parameters are passed in from the ExpressError class
    super();// Calls the parent (Error class) so that "this" can be used to refer to Error class
    this.message = message; // Translates to "Error.message = message(passed in)" etc etc
    this.statusCode = statusCode;
  }
};
module.exports.ExpressError = ExpressError

module.exports.catchAsyncErr = (func) => { // A fucntion is passed in
  return (req, res, next) => { // A new function is returned with req, res & next (from app.get) passed in
    func(req, res, next).catch(e => next(e)); // func is excecuted with parameters passed in from the new function
  }; // And if there is an error .catch gets it and passed it to next.
};

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl 
    // ^^ Stores the path the user was trying to get to wihin the session so it can be used later
    req.flash("error", "You must be signed in first!");
    return res.redirect("/login");
  }
  next();
};

module.exports.validateReview = (req, res, next) => {
  const{ error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",")
    throw new ExpressError(msg, 400)
  } else {
    next()
  }
};

module.exports.validateCampground = (req, res, next) => {
  const{ error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",") // error.details is an array and we want the object in it
    throw new ExpressError(msg, 400)
  } else {
    next()
  }
};

module.exports.isCampAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/campgrounds/${id}`)
  } else {
    next()
  };
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/campgrounds/${id}`)
  } else {
    next()
  };
};