const express = require('express');
const bcrypt = require('bcrypt');

const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { validateEditProfileData, validatePasswordChangeData } = require('../utils/validation');


profileRouter.get("/profile/view", userAuth, async (req, res) => {
    try {
        const user = req.user; // The user is attached to the request object by the userAuth middleware
        if (!user) {
            return res.status(404).send("User not found...");
        }
        res.send(user);
    }
    catch (err) {
        console.log(err);
        return res.status(400).send("Error while fetching user profile..." + err.message);
    }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
    try {
        if (!validateEditProfileData(req)) {
            throw new Error("Invalid fields for profile update...");
        }

        const loggedInUser = req.user;

        Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));

        await loggedInUser.save(); // Save the updated user profile to the database
        res.json({
            message: `${loggedInUser.firstName} ${loggedInUser.lastName} - your profile updated successfully...`,
            data: loggedInUser
        });
    } catch (error) {
        console.log(error);
        return res.status(400).send("Error while updating user profile..." + error.message);

    }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
    try {
       validatePasswordChangeData(req);
        const { oldPassword, newPassword } = req.body;
        const loggedInUser = req.user;

        // Check if the old password matches
        const isPasswordValid = await loggedInUser.validatePassword(oldPassword);
        if (!isPasswordValid) {
            throw new Error("Old password is incorrect.");
        }

        // Update the password
        loggedInUser.password = await bcrypt.hash(newPassword, 10);
        await loggedInUser.save();

        res.json({
            message: "Password updated successfully.",
            data: loggedInUser
        });
    } catch (error) {
        console.log(error);
        return res.status(400).send("Error while updating password..." + error.message);
    }
});

module.exports = profileRouter;