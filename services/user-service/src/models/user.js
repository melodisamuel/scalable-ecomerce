const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    name: String,
    email: { type: String, Unique: true, index: true },
    password: String,
    role: { type: String, 
        default: 'user' },
    CreatedAt: { type: Date, default: Date.now}
})

module.exports = mongoose.model('User', userSchema);