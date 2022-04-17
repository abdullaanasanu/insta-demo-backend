const express = require('express');
const User = require('../../models/User');
const Auth = require('../../libs/Auth');
const Post = require('../../models/Post');
const Like = require('../../models/Like');
const Comment = require('../../models/Comment');
const router = express.Router();

router.get('/list', Auth.isLoggedIn, async (req, res) => {
    let {page, limit} = req.query;
    if (!page) {
        page = 0
    }
    if (!limit) {
        limit = 5
    }
    let posts = await Post.find().skip(page * limit).limit(limit).populate('postedBy').lean();
    posts = await Promise.all(posts.map(async post => {
        post.likes = await Like.count({postId: post._id})
        post.comments = await Comment.count({postId: post._id})
        let fetchUserLike = await Like.find({postId: post._id, likedBy: req.user})
        post.isLiked = fetchUserLike.length !== 0
        return post;
    }))
    return res.json({posts})
});

router.post('/create', Auth.isLoggedIn, (req, res) => {
    let {contentLink, contentType, description} = req.body;
    Post.create({
        contentLink, contentType, description,
        postedBy: req.user
    }).then(() => {
        return res.json({
            message: "Post created!"
        })
    })
})

router.get('/:postId', Auth.isLoggedIn, async(req, res) => {
    let { postId } = req.params;
    let post = await Post.findById(postId);
    return res.json({post})
})

router.get('/like/:postId', Auth.isLoggedIn, async(req, res) => {
    let { postId } = req.params;
    let post = await Post.findById(postId);
    if (!post) {
        return res.status(404).json({message: "Post doesn't exist"});
    }
    let isLiked = await Like.findOne({
        postId,
        likedBy: req.user
    })
    if (isLiked) {
        return res.status(400).json({message: "Already liked!"});
    }
    Like.create({
        postId,
        likedBy: req.user
    }).then(() => {
        return res.json({message: "You Liked"})
    })
})

router.delete('/like/:postId', Auth.isLoggedIn, async(req, res) => {
    let { postId } = req.params;
    let post = await Post.findById(postId);
    if (!post) {
        return res.status(404).json({message: "Post doesn't exist"});
    }
    let isLiked = await Like.findOne({
        postId,
        likedBy: req.user
    })
    if (isLiked) {
        Like.findByIdAndRemove(isLiked._id).then(() => {
            return res.json({message: "You Unliked"})
        })
    }else{
        return res.status(400).json({message: "You are not liked yet"});
    }
})

router.post('/comment/:postId', Auth.isLoggedIn, async(req, res) => {
    let { postId } = req.params;
    let {comment} = req.body;
    let post = await Post.findById(postId);
    if (!post) {
        return res.status(404).json({message: "Post doesn't exist"});
    }
    Comment.create({
        postId,
        commentedBy: req.user,
        comment
    }).then(() => {
        return res.json({message: "You have commented!"})
    })
})

router.get('/comment/list/:postId', Auth.isLoggedIn, async(req, res) => {
    let { postId } = req.params;
    let post = await Post.findById(postId);
    if (!post) {
        return res.status(404).json({message: "Post doesn't exist"});
    }
    let comments = await Comment.find({
        postId
    }).populate("commentedBy", "fullName")
    return res.json({
        comments
    })
})

module.exports = router;