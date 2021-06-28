const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema ({
  email: {
    type: String,
    required: true,
    unique: true
  }
})

UserSchema.plugin(passportLocalMongoose); 
// Adds username & password + some attributes for them and some methods we can use on the schema

module.exports = mongoose.model("User", UserSchema);