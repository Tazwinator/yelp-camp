const express = require("express");
const router = express.Router({mergeParams: true});
const { catchAsyncErr, ExpressError, isLoggedIn, validateCampground, isCampAuthor } = require("../middleware/middleware");

const campgrounds = require("../controllers/campgrounds");

const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });


// ----------------------------------Campground Routes------------------------------------------------------- //

router.route("/")
  .get(catchAsyncErr(campgrounds.index))
  .post(isLoggedIn, upload.array("campground[image]"), validateCampground, catchAsyncErr(campgrounds.newSubmit));

router.get("/new", isLoggedIn, campgrounds.new);

router.route("/:id")
  .get(catchAsyncErr(campgrounds.show))
  .put(isLoggedIn, isCampAuthor, upload.array("campground[image]"), validateCampground, catchAsyncErr(campgrounds.editSubmit))
  .delete(isLoggedIn, isCampAuthor, catchAsyncErr(campgrounds.deleteSubmit));

router.get("/:id/edit", isLoggedIn, isCampAuthor, catchAsyncErr(campgrounds.edit));

module.exports = router;