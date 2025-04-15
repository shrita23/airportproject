const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email:String,
    password:String,
    confirmPassword:String
})

const userModel = mongoose.model('user', userSchema);
module.exports = userModel;