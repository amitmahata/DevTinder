const express = require('express');

const authRouter = express.Router();

const { validateSignUpData } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");


authRouter.post("/signup", async (req, res) => {
    try {
        // Validate the request body
        validateSignUpData(req);

        const { firstName, lastName, emailId, password } = req.body;

        // Hash the password
        const passwordHash = await bcrypt.hash(password, 10);
        console.log(passwordHash);
        req.body.password = passwordHash;

        const user = new User({
            firstName,
            lastName,
            emailId,
            password: passwordHash,
        });

        await user.save();
        res.send("User added successfully...");
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Error while adding user..." + err.message);
    }
});

authRouter.post("/login", async (req, res) => {
    try {
        const { emailId, password } = req.body;
        // Find the user by emailId
        const user = await User.findOne({ emailId });
        if (!user) {
            return res.status(404).send("Invalid credentials......");
        }
        // Compare the password with the hashed password
        const isPasswordValid = await user.validatePassword(password);

        if (isPasswordValid) {
            const token = await user.getJWT(); // Generate JWT token
            console.log(token);

            res.cookie("token", token, { expires: new Date(Date.now() + 24 * 60 * 60 * 1000) }); // Set a cookie with the user ID
            res.send(user);
        }
        else {
            throw new Error("Invalid password...");
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Invalid credentials..." + err.message);
    }
});

authRouter.post("/logout", async (req, res) => {
    try {
        //res.clearCookie("token"); // Clear the cookie
        res.cookie("token", "", { expires: new Date(Date.now() - 24 * 60 * 60 * 1000) }); // Set the cookie to expire immediately
        res.send("Logout successful");
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Error while logging out..." + err.message);
    }
});

module.exports = authRouter;