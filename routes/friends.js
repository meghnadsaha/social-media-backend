const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const FriendRequest = require("../models/FriendRequest");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Send Friend Request
// router.post('/request', authMiddleware, async (req, res) => {
//     const { toUserId } = req.body;
//     try {
//         if (toUserId.equals(req.user._id)) {
//             return res.status(400).send({ error: "You cannot send a friend request to yourself." });
//         }
//         const existingRequest = await FriendRequest.findOne({ fromUserId: req.user._id, toUserId });
//         if (existingRequest) {
//             return res.status(400).send({ error: "Friend request already sent." });
//         }

//         const request = new FriendRequest({ fromUserId: req.user._id, toUserId });
//         await request.save();
//         res.status(201).send(request);
//     } catch (error) {
//         res.status(400).send(error);
//     }
// });

// Send Friend Request
router.post("/request", authMiddleware, async (req, res) => {
  const { toUserId } = req.body;
  try {
    console.log("Request body:", req.body); // Log the request body
    console.log("Authenticated user:", req.user); // Log authenticated user details

    if (!mongoose.Types.ObjectId.isValid(toUserId)) {
      return res.status(400).send({ error: "Invalid user ID." });
    }

    // Convert toUserId to ObjectId
    const toUserObjectId = new mongoose.Types.ObjectId(toUserId);

    if (toUserObjectId.equals(req.user._id)) {
      return res
        .status(400)
        .send({ error: "You cannot send a friend request to yourself." });
    }

    const existingRequest = await FriendRequest.findOne({
      fromUserId: req.user._id,
      toUserId: toUserObjectId,
    });
    if (existingRequest) {
      return res.status(400).send({ error: "Friend request already sent." });
    }

    const request = new FriendRequest({
      fromUserId: req.user._id,
      toUserId: toUserObjectId,
    });
    await request.save();
    res.status(201).send(request);
  } catch (error) {
    console.error("Error:", error); // Log the error
    res.status(400).send(error);
  }
});

// Get Pending Friend Requests
router.get("/requests", authMiddleware, async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      toUserId: req.user._id,
      status: "pending",
    }).populate("fromUserId");
    res.send(requests);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Accept Friend Request
router.post("/accept", authMiddleware, async (req, res) => {
    const { requestId } = req.body;
    try {
        console.log('Request ID:', requestId); // Log request ID
        const objectId =new mongoose.Types.ObjectId(requestId); // Convert to ObjectId
        console.log('Converted ObjectId:', objectId); // Log converted ObjectId

        // Find the friend request
        let request;
        try {
            request = await FriendRequest.findById(objectId);
        } catch (err) {
            return res.status(500).send({ error: 'Error finding friend request.' });
        }
        console.log('equest.toUserId.toString():', request.toUserId.toString()); // Log request ID
        console.log('req.user._id.toString():', req.user._id.toString()); // Log request ID

        // if (!request || request.toUserId.toString() !== req.user._id.toString()) {
        //     return res.status(404).send({ error: "Friend request not found." });
        // }

        // Update request status
        try {
            request.status = "accepted";
            await request.save();
        } catch (err) {
            return res.status(500).send({ error: 'Error updating friend request status.' });
        }

        // Update fromUser
        let fromUser;
        try {
            fromUser = await User.findById(request.fromUserId);
        } catch (err) {
            return res.status(500).send({ error: 'Error finding fromUser.' });
        }

        if (!fromUser) {
            return res.status(404).send({ error: 'From user not found.' });
        }

        try {
            fromUser.friends.push(req.user._id);
            await fromUser.save();
        } catch (err) {
            return res.status(500).send({ error: 'Error updating fromUser friends list.' });
        }

        // Update toUser
        let toUser;
        try {
            toUser = await User.findById(request.toUserId);
        } catch (err) {
            return res.status(500).send({ error: 'Error finding toUser.' });
        }

        if (!toUser) {
            return res.status(404).send({ error: 'To user not found.' });
        }

        try {
            toUser.friends.push(request.fromUserId);
            await toUser.save();
        } catch (err) {
            return res.status(500).send({ error: 'Error updating toUser friends list.' });
        }

        res.send(request);
    } catch (error) {
        console.error('Error:', error); // Log general error
        res.status(500).send({ error: 'Internal server error.' });
    }
});


// Reject Friend Request
router.post("/reject", authMiddleware, async (req, res) => {
  const { requestId } = req.body;
  try {
    const objectId =new mongoose.Types.ObjectId(requestId); // Convert to ObjectId

    const request = await FriendRequest.findById(objectId);
    // if (!request || request.toUserId.toString() !== req.user._id.toString()) {
    //   return res.status(404).send({ error: "Friend request not found." });
    // }
    request.status = "rejected";
    await request.save();
    res.send(request);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Cancel Sent Friend Request
router.post("/cancel", authMiddleware, async (req, res) => {
  const { requestId } = req.body;
  try {
    const request = await FriendRequest.findOne({
      _id: requestId,
      fromUserId: req.user._id,
    });
    if (!request) {
      return res.status(404).send({ error: "Friend request not found." });
    }
    await request.remove();
    res.send({ message: "Friend request cancelled." });
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;

// const express = require('express');
// const User = require('../models/User');
// const authMiddleware = require('../middleware/authMiddleware');

// const router = express.Router();

// router.post('/request', authMiddleware, async (req, res) => {
//     const { toUserId } = req.body;
//     try {
//         const request = { requestId: new mongoose.Types.ObjectId(), fromUserId: req.user._id, status: 'pending' };
//         await User.findByIdAndUpdate(toUserId, { $push: { friendRequests: request } });
//         res.status(201).send(request);
//     } catch (error) {
//         res.status(400).send(error);
//     }
// });

// router.post('/accept', authMiddleware, async (req, res) => {
//     const { requestId } = req.body;
//     try {
//         const user = await User.findOne({ 'friendRequests.requestId': requestId });
//         const request = user.friendRequests.id(requestId);
//         request.status = 'accepted';
//         user.friends.push(request.fromUserId);
//         await user.save();

//         const fromUser = await User.findById(request.fromUserId);
//         fromUser.friends.push(user._id);
//         await fromUser.save();

//         res.send(request);
//     } catch (error) {
//         res.status(400).send(error);
//     }
// });

// router.post('/reject', authMiddleware, async (req, res) => {
//     const { requestId } = req.body;
//     try {
//         const user = await User.findOne({ 'friendRequests.requestId': requestId });
//         const request = user.friendRequests.id(requestId);
//         request.status = 'rejected';
//         await user.save();
//         res.send(request);
//     } catch (error) {
//         res.status(400).send(error);
//     }
// });

// module.exports = router;
