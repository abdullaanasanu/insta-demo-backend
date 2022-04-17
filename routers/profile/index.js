const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../../models/User');
const Auth = require('../../libs/Auth')
const jwt = require('jsonwebtoken');
const Follow = require('../../models/Follow');
const Post = require('../../models/Post');
const router = express.Router();
const saltRounds = 10;


router.get('/', Auth.isLoggedIn, async (req, res) => {

    return res.json({ user: req.user })
})

router.put('/', Auth.isLoggedIn, async (req, res) => {
    let { fullName, email, username } = req.body;
    let user = req.user;
    if (fullName) {
        user.fullName = fullName
    }
    if (email) {
        let validateEmail = await User.findOne({ email })
        if (validateEmail) {
            return res.status(400).json({ message: "Email already in use" })
        }
        user.email = email
    }
    if (username) {
        let validateUsername = await User.findOne({ username })
        if (validateUsername) {
            return res.status(400).json({ message: "Username already in use" })
        }
        user.username = username
    }
    user.save().then(() => {
        return res.json({ message: "Profile updated" })
    })
})

router.get('/get-profile', Auth.isLoggedIn, async (req, res) => {

    let followering = await Follow.count({followingBy: req.user})
    let followers = await Follow.count({followingTo: req.user})

    let posts = await Post.find({postedBy: req.user })

    return res.json({ user: req.user, followering, followers, posts })
})

router.get('/:id', Auth.isLoggedIn, async (req, res) => {

    let followering = await Follow.count({followingBy: req.params.id})
    let followers = await Follow.count({followingTo: req.params.id})

    let followStatus = await Follow.find({followingBy: req.user, followingTo: req.params.id })

    let posts = await Post.find({postedBy: req.params.id })

    let user = await User.findById(req.params.id)

    return res.json({ user, followering, followers, posts, isFollowing: followStatus.length !== 0 })
})

router.post('/follow', Auth.isLoggedIn, async (req, res) => {
    let { followingTo } = req.body;
    let checkFollow = await Follow.findOne({
        followingTo,
        followingBy: req.user
    })
    if (checkFollow) {
        return res.status(403).json({message: "You are already following"})
    }
    Follow.create({
        followingTo,
        followingBy: req.user
    }).then(() => {
        return res.json({message: "You have followed"})
    })
})

router.get('/list/following', Auth.isLoggedIn, async (req, res) => {
    let following = await Follow.find({followingBy: req.user}).populate('followingTo', 'fullName username email')
    return res.json({ following })
})

router.get('/list/followers', Auth.isLoggedIn, async (req, res) => {
    let followers = await Follow.find({followingTo: req.user}).populate('followingBy', 'fullName username email')
    return res.json({ followers })
})

module.exports = router;