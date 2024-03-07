const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
    userId: { type: Number, unique: true },
    firstName: String,
    dob: { type: Date, default: null },
    address: String,
    phoneNumber: String,
    state: String,
    zipCode: String,
    email: String,
    gender: String,
    userType: String
});


const UserModel = model('users', UserSchema);

module.exports = UserModel;