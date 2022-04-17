const mongoose = require('mongoose');
const { Schema } = mongoose;

const followSchema = new Schema({
    followingBy: {type: mongoose.Types.ObjectId, ref: 'User'},
    followingTo: {type: mongoose.Types.ObjectId, ref: 'User'}
});

module.exports = mongoose.model('Follow', followSchema);