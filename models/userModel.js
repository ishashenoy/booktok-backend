const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    username : {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ['user', 'author'],
        default: 'user'
    },
    password : {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);