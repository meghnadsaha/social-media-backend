const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    profileInfo: {
        name: String,
        bio: String,
        profilePicture: String
    },
    friends: [{ type: Schema.Types.ObjectId, ref: 'User' }]
    //,
    // friendRequests: [
    //     {
    //         requestId: { type: Schema.Types.ObjectId, unique: true },
    //         fromUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    //         status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
    //     }
    // ]
});



module.exports = mongoose.model('User', userSchema);
