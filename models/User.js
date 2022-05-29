const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;
const UserSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        isAdmin: {
            type: Boolean,
            default: false
        },
        mnemonic: { type: String }
    },
);

module.exports = mongoose.model('User', UserSchema);