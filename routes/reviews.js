const express = require("express");
const router = express.Router({mergeParams: true});
const { catchAsyncErr, ExpressError, isLoggedIn, validateReview, isReviewAuthor } = require("../middleware/middleware");

const reviews = require("../controllers/reviews");


// -------------------------------- Review Routes -------------------------------------------------------- //

router.post("/", isLoggedIn, validateReview, catchAsyncErr(reviews.newSubmit));

router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsyncErr(reviews.delete))

module.exports = router;