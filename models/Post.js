const mongoose = require('mongoose');
const { Schema } = mongoose;

const postSchema = new Schema({
    contentLink: {type: String, required: true},
    contentType: {type: String, enum: ["image", "video"]},
    description: {type: String},
    postedBy: {type: mongoose.Types.ObjectId, ref: 'User'},
    postedAt: {type: Date, default: Date.now()}
});

module.exports = mongoose.model('Post', postSchema);