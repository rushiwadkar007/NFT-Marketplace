const User = require('../models/User');
const crypto = require('crypto-js');
const { rmSync, access } = require('fs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {

    console.log(req.body.username);

    const newUser = new User({

        username: req.body.username,

        email: req.body.email,

        password: crypto.AES.encrypt(req.body.password, process.env.PASS_SEC).toString(),

        isAdmin: req.body.isAdmin,

        mnemonic: ""

    });

    try {

        const savedUser = await newUser.save()

        res.status(201).json(savedUser);

    }
    catch (error) {

        res.status(500).json(error);

    }

}

const login = async (req, res) => {

    try {

        const user = await User.findOne({ username: req.body.username });

        if (!user) {

            res.status(401).json("Wrong credentials!");

        }
        else {

            const hashedPassword = crypto.AES.decrypt(user.password, process.env.PASS_SEC);

            const originalPassword = hashedPassword.toString(crypto.enc.Utf8);

            const accessToken = jwt.sign({
                id: user._id,
                isAdmin: user.isAdmin
            }, process.env.JWT_SEC,
                { expiresIn: "3d" });

            originalPassword !== req.body.password && res.status(401).json("Wrong credentials!");

            const { password, ...others } = user._doc;

            res.status(200).json({ others, accessToken });
        }



    }

    catch (error) {

        res.send(error);

    }

}

module.exports = { register, login }