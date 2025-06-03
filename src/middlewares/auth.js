const jwt = require('jsonwebtoken');
const User = require("../models/user");

const userAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if(!token) {
            return res.status(401).send("Please login...");
        }
        const decodedObj = await jwt.verify(token, "Node@dev$123");
        const { _id } = decodedObj;

        const user = await User.findById(_id);
        if (!user) {
            throw new Error("User not found...");
        }

        req.user = user; // Attach user to request object
        next();
    }
    catch (err) {
        console.log(err);
        return res.status(400).send("Error while authenticating user..." + err.message);
    }

};

module.exports = {
    userAuth,
};