const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: String,
    phone: String,
    password: String
});

module.exports = mongoose.model("users", userSchema);