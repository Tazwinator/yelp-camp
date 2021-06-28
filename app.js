if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
};

/* npm WARN lifecycle The node binary used for scripts is /usr/bin/node but 
npm is using /opt/plesk/node/12/bin/node itself. 
Use the `--scripts-prepend-node-path` option to include the path for the node binary npm was executed with. 

^^^^^^ I BELIEVE THIS IS BECAUSE ON MY SERVER THERE ARE TWO NPMs AND TWO NODE runtimes
*/

const express = require("express"); // With require you don't need __dirname
const app = express();

const ejsMate = require("ejs-mate");
const path = require("path"); // For path.join
const methodOverride = require("method-override") // Module that overrides HTML HTTP form restrictions
const fs = require('fs') // Stands for file system (built-in node.js library)
const { ExpressError } = require("./middleware/middleware");
const session = require("express-session");
const flash = require("connect-flash");
const MongoDBStore = require("connect-mongo"); // This "session" at the end immediately executes the function

const userRoutes = require("./routes/users"); // For express router.gets -- Some app.use middleware below that continue this
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");

const passport = require("passport");
const passportLocal = require("passport-local");
const User = require("./models/user");

const helmet = require("helmet");
const { CSPConfig } = require("./security/helmetConfig");

const mongoSanitize = require("express-mongo-sanitize");
// mongoSanitize.sanitize(payloads, options) ---- I made Express use it in the midleware below
/* This module searches for 
any keys in objects that begin with a $ sign or contain a ., from req.body, req.query or req.params. 
It can then either:
      completely remove these keys and associated data from the object, or
      replace the prohibited characters with another allowed character.
The behaviour is governed by the passed option, { replaceWith: "" } 
Set this option to have the sanitizer replace the prohibited characters with the character passed in. */


// ---------------- Logger ------------------- //
const morgan = require("morgan"); // Logger module
// create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' })
// setup the logger
app.use(morgan('combined', { stream: accessLogStream }))



const Mongoose = require("mongoose");
// Connects to the specified db on the mongo server via mongoose.
// If the db is not found it creates one.
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp"
Mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useCreateIndex: true, // These parameters should always be used unless I found out more about them.
  useUnifiedTopology: true,
  useFindAndModify: false // This one fixes a deprication eroor with finbByIdAndDelete
});

const db = Mongoose.connection;
db.on("error", console.error.bind("console", "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});



app.engine("ejs", ejsMate)
app.set("view engine", "ejs"); // Sets the file type res.render should look for
// It seems as though you do not need to require ejs because of this above.
app.set("views", path.join(__dirname, "views")); // Sets the directory where res.render will look.

// --------------------------------------- Middleware ----------------------------------------------------------- //

app.use(express.urlencoded({extended: true})); // Parses the data sent by POST from a form so it can be used here.
app.use(methodOverride("_method"))

app.use(mongoSanitize()); // Making Express use mongoSanitize

// -------------------------------------------- Security / Helmet ----------------------------------------------------------- //


app.use(helmet());
app.use(helmet.contentSecurityPolicy(CSPConfig));


// --------- Static Files AKA JavaScript & CSS files that can be sent with HTML via the script tag -------------- //

app.use(express.static(path.join(__dirname, "public")))

// --------- Session --------------------------- //

const secret = process.env.SECRET || "thishouldbeabettersecret!";

const store = new MongoDBStore ({
  mongoUrl: dbUrl,
  secret: secret,
  touchAfter: 24 * 60 * 60 // In seconds, delay between session saves to the db when nothing has been updated
});

store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e)
});

const sessionConfig = { // Sets up the sessionId cookie
  store,
  name: "SID",
  secret: secret, // this and SHA256 encrypt the cookie
  resave: false,
  saveUninitialized: false,
  cookie: { // cookie attributes
    httpOnly: true,
    // secure: true; ONLY SETS SESSION COOKIES ON SECURE CONNECTIONS (HTTPS), DOES NOT WORK ON LOCALHOST!!!!!!!!!!!!
    expires: Date.now() + 1000 * 60 * 60 *24 * 7, // Milliseconds
    maxAge: 1000 * 60 * 60 *24 * 7
  }
};
app.use(session(sessionConfig)); // deploys the sessionId cookie

// --------- Passport --------------------------- //

app.use(passport.initialize()); // Sets up passport
app.use(passport.session()); // Makes it use the express-session for persistant sessions
passport.use(new passportLocal(User.authenticate()));
// This line tells passport that with the local strategy of authentication we are going to use -
// the "User" model.
// The authenticate method on the "User" model comes from the plugin we added in the model file

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// --------- Flash --------------------------- //
app.use(flash()); // Tells express to use flash. Flash is basially a popup plugin.

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
  // If "success" is in the request then it will pass it through to the template (so you don't have to do it manually)
});

// --------- Other (also to play around with and test stuff) --------------------------- //

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

// ---------------------------------Route Handlers----------------------------------------------------------- //

app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);
app.use("/", userRoutes);

// ---------------------------------Routes------------------------------------------------------------------ //

app.get("/", (req, res) => { // Every time a get request is made to the server on specified route.
  res.render("pages/home.ejs");  // Here is is the root page. req and res are objects for request sent and respone to send.
});


// This app.all below will only run if the routes above are not matched with the request
// * = everything
app.all("*", (req, res, next) => { // .all is for all HTTP methods (so nto just if the app is used like .use)
  next(new ExpressError("Webpage not found", 404));
});

// For unhandled errors
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong!";
  if (err.message === "Something went wrong!") console.log(err);
  res.status(statusCode).render("pages/error", { err, statusCode });
});

const port = process.env.PORT || 3000
app.listen(port, () => { // Actually turns the server on. Makes it listen for requests on a specified port.
  console.log(`Serving on port ${port}`);
});