const express = require('express');

const requestRouter = express.Router();
const { userAuth } = require("../middlewares/auth");

requestRouter.post("/sendConnectionRequest", userAuth, async (req, res) => {

    res.send("Connection request sent successfully by " + req.user.firstName + " " + req.user.lastName);

});

module.exports = requestRouter;