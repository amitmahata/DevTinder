const express = require('express');
const { userAuth } = require('../middlewares/auth');
const ConnectionRequest = require('../models/connectionRequest');
const User = require('../models/user');

const userRouter = express.Router();

const USER_SAFE_DATA = ['firstName', 'lastName', 'emailId', 'photoUrl', 'about', 'skills', 'gender', 'age'];

userRouter.get("/user/requests/received", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const pendingRequests = await ConnectionRequest.find({
            toUserId: loggedInUser._id,
            status: 'interested'
        }).populate('fromUserId', 'firstName lastName photoUrl about skills gender age');

        res.json({
            message: "Connection requests found",
            data: pendingRequests
        });
    }
    catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
});

userRouter.get("/user/connection", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const connectionRequest = await ConnectionRequest.find({
            $or: [
                { fromUserId: loggedInUser._id, status: 'accepted' },
                { toUserId: loggedInUser._id, status: 'accepted' }
            ]
        }).populate('fromUserId', USER_SAFE_DATA).populate('toUserId', USER_SAFE_DATA);

        const data = connectionRequest.map((row) => {
            if (row.fromUserId === loggedInUser._id) {
                return row.toUserId
            }
            return row.fromUserId
        });

        res.json({
            message: "Your connections found",
            data: data
        });
    }
    catch (err) {
        res.status(400).send({ message: err.message });
    }
});

userRouter.get('/feed', userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        limit = limit > 20 ? 20 : limit;
        const skip = (page - 1) * limit;

        const connectionRequest = await ConnectionRequest.find({
            $or: [
                { fromUserId: loggedInUser._id },
                { toUserId: loggedInUser._id }
            ]
        }).select('fromUserId toUserId');

        const hideUsersFromFeed = new Set();
        connectionRequest.forEach((row) => {
            hideUsersFromFeed.add(row.toUserId.toString());
            hideUsersFromFeed.add(row.fromUserId.toString());
        });

        const users = await User.find({
            $and: [
                { _id: { $nin: Array.from(hideUsersFromFeed) } },
                { _id: { $ne: loggedInUser._id } }
            ]

        }).select(USER_SAFE_DATA)
            .skip(skip)
            .limit(limit);

        res.json({
            message: "Users to show in your feed",
            data: users
        });
    }
    catch (err) {
        res.status(400).send({ message: err.message });
    }
});

module.exports = userRouter;