const mongoose = require("mongoose");
const Schema = mongoose.Schema; // Shortcut
const Review = require("./review");

const ImageSchema = new Schema({
  url: String,
  filename: String
});

// Virtuals are accessed like properties. Whereas methods are accessed like functions.
// Quoted from stack overflow "You could technically use methods for everything and never use virtual properties, 
// but virtual properties are elegant for certain things."
// Go look at the edit template and see how this virtual is used, see if you can figure it out.
ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
}); // We are using a virtual because there is no point in storing to URLs. Not sure why we have to use a new schema tho


const options = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({ // Sets the schema for all database entries. Each one can have parameters
  title: String,  // Doesn't matter what order they are in but they have to be the same data type and name
  images: [ImageSchema],
  geometry: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  price: Number,
  description: String,
  location: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: "User" // This ref tells mongoose what Model to search in with this ID
  },
  reviews: [ // Connects this schema to the reviews schema
    {
      type: Schema.Types.ObjectId,
      ref: "Review"
    }
  ]
}, options);

CampgroundSchema.virtual("properties.popUpMarkup").get(function () {
  return `
  <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
  <p>${this.description.substring(0, 20)}</p>
  `;
});

CampgroundSchema.post("findOneAndDelete", async function (doc) { // Deleting reviews after a campground is deleted
  if(doc) { // If there is a campground (that has been deleted), delete the reviews that have an id in the campground
    await Review.deleteMany({
      _id: {
        $in: doc.reviews
      }
    })
  }
})

// Creates the model (collection in Mongo) and exports it.
module.exports = mongoose.model("Campground", CampgroundSchema); 