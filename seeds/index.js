const cities = require("./cities")
const { descriptors, places } = require("./seedHelpers")
const Mongoose = require("mongoose");
const Campground = require("../models/campground"); // not camel-cased because the only export is a class/model.
const Review = require("../models/review");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
};


// Connects to the specified db on the mongoose server.
// If the db is not found it creates one.
const dbUrl = "mongodb+srv://tyrone:tyronepassword@tazwin-cluster.cdgxf.mongodb.net/yelp-camp?retryWrites=true&w=majority";
Mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useCreateIndex: true, // These three parameters should always be used unless I found out more about them.
  useUnifiedTopology: true
});

const db = Mongoose.connection;
db.on("error", console.error.bind("console", "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});


const sample = array => array[Math.floor(Math.random() * array.length)];
// For the title seeding in DB

const seedDB = async () => {
  await Campground.deleteMany({});
  await Review.deleteMany({});

  for (let i = 0; i < 10; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;

    const camp = new Campground ({
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Placeat dolore modi, minus reiciendis perferendis eveniet omnis vel voluptatum nesciunt? Id error doloremque quisquam adipisci maxime ea totam quis explicabo. Nostrum.",
      price,
      author: "60d954b55f8159fc8d9c852f",
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude
        ]
      },
      images: [
        {
          url: 'https://res.cloudinary.com/dpnoadei5/image/upload/v1624067395/YelpCamp/bfyrsjvndpaqlttrccs7.jpg',
          filename: 'YelpCamp/bfyrsjvndpaqlttrccs7'
        },
        {
          url: 'https://res.cloudinary.com/dpnoadei5/image/upload/v1624067395/YelpCamp/yhf3i8judaf13slxgmho.jpg',
          filename: 'YelpCamp/yhf3i8judaf13slxgmho'
        },
        {
          url: 'https://res.cloudinary.com/dpnoadei5/image/upload/v1624067395/YelpCamp/idlotoflac31r7gjq5ru.jpg',
          filename: 'YelpCamp/idlotoflac31r7gjq5ru'
        }
      ]
    });
    await camp.save()
  }
}

seedDB().then( () => {
  Mongoose.connection.close()
  console.log("Database disconnected")
})