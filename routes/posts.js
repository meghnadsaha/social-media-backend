const express = require('express');
const mongoose = require('mongoose');
const Post = require('../models/Post');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
    try {
        const post = new Post({ userId: req.user._id, content: req.body.content });
        await post.save();
        res.status(201).send(post);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get('/feed', authMiddleware, async (req, res) => {
    try {
        const friends = req.user.friends;
        const friendPosts = await Post.find({ userId: { $in: friends } }).sort({ createdAt: -1 });

        const commentedPosts = await Post.find({ 'comments.userId': { $in: friends } }).sort({ createdAt: -1 });
        const uniqueCommentedPosts = commentedPosts.filter(post => !friendPosts.some(fp => fp._id.equals(post._id)));

        const feed = [...friendPosts, ...uniqueCommentedPosts];
        feed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.send(feed);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.post('/:postId/comments', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        const comment = { commentId: new mongoose.Types.ObjectId(), userId: req.user._id, content: req.body.content, createdAt: new Date() };
        post.comments.push(comment);
        await post.save();
        res.status(201).send(comment);
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router;
