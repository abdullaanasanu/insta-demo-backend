const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const router = express.Router();
const saltRounds = 10;

router.post('/register', async (req, res) => {
    let {fullName, email, username, password} = req.body;
    let user = await User.findOne({}).or([{username}, {email}]);
    if (user) {
        return res.status(400).json({ message: "email or username already in use!"})
    }
    bcrypt.hash(password, saltRounds, function(err, hash) {
        User.create({
            fullName,
            email,
            username,
            password: hash
        }).then(() => {
            return res.json({message: 'User Registered!'})
        }).catch(() => {
            return res.status(400).json({message: "Something went wrong!"})
        })
    });
})

router.post('/login', async (req, res) => {
    let {email, password} = req.body;
    let user = await User.findOne({}).or([{username: email}, {email}]);
    if (user) {
        bcrypt.compare(password, user.password, function(err, result) {
            if (result) {
                var token = jwt.sign({ userId: user._id }, process.env.AUTH_SECRET_KEY);
                res.json({message: "Login Successful", token})
            }else{
                return res.status(400).json({message: "Invalid username/email or password"})
            }
        });
    }else{
        return res.status(400).json({message: "Invalid username/email or password"})
    }
})

module.exports = router;