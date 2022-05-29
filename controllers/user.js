

const router = require('express').Router();

const User = require('../models/User');

const crypto = require('crypto-js');

const verifyTokenController = async (req, res) => {

    if (req.body.password) {
        req.body.password = crypto.AES.encrypt(
            req.body.password,
            process.env.PASS_SEC
        ).toString()
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, {
            $set: { password: req.body.password }
        }, { new: true });

        res.status(200).json(updatedUser);
    }
    catch (err) {
        res.status(500).json(err);
    }
}

module.exports = verifyTokenController;