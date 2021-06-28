const express = require("express");
const Campground = require("../models/campground"); // not camel-cased because the only export is a class/model.
const { cloudinary } = require("../cloudinary/index");

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken })

module.exports.index = async (req, res) => { // Index route
  const campgrounds = await Campground.find({});
  res.render("pages/index", { campgrounds });
};

module.exports.new = (req, res) => { // New page
  res.render("pages/new");
};

module.exports.newSubmit = async (req, res) => { // New submit
  const geoData = await geocoder.forwardGeocode({
    query: req.body.campground.location,
    limit: 1
  }).send();
  const campground = new Campground(req.body.campground);
  campground.geometry = geoData.body.features[0].geometry;
  campground.images = req.files.map(f => ({url: f.path, filename: f.filename}));
  campground.author = req.user._id
  await campground.save();
  req.flash("success", "Success, you have successfully made a new campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.editSubmit = async (req, res) => { // Edit submit
  const { id } = req.params;
  campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
  const imgs = req.files.map(f => ({url: f.path, filename: f.filename})); // This makes an array
  campground.images.push(...imgs);
  console.log(campground.geometry);
  // So here we spread the array into seperate arguemnts and it will put them in an object for us
  await campground.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({ $pull: {images: { filename: { $in: req.body.deleteImages }}}});
    // Pull out of one campground all images in the images array where their value of filename is in req.body.deleteImages
  }
  req.flash("success", "Success, you have successfully edited this campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteSubmit = async (req, res) => { // Delete submit
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Success, you have successfully deleted the campground!");
  res.redirect("/campgrounds");
};

module.exports.show = async (req, res) => { // Show single campground route
  const campground = await Campground.findById(req.params.id).populate({
    path: "reviews", // Populate reviws at this path
    populate: { // Then within them populated reviews 
      path: "author" // Populate the authors of them reviews
    } // Not as straight forward as it should be is it
  }).populate("author");
  if (!campground) {
    req.flash("error", "There has been an error finding this campground.");
    res.redirect("/campgrounds");
  }
  res.render("pages/show", { campground });
};

module.exports.edit = async (req, res) => { // Edit page
  const campground = await Campground.findById(req.params.id);
  res.render("pages/edit", { campground });
};
