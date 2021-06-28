const express = require("express");
const Review = require("../models/review")
const Campground = require("../models/campground") // not camel-cased because the only export is a class/model.

module.exports.newSubmit = async (req, res) => { // Make a review
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  review.author = req.user._id;
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  req.flash("success", "Success, you have successfully made a review!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.delete = async (req, res) => {
  const { id, reviewId } = req.params;
  await Campground.findByIdAndUpdate(id, { $pull: {reviews: reviewId} }); // Removes the review ID
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Success, you have successfully removed the review! ");
  res.redirect(`/campgrounds/${id}`)
};