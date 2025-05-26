const express = require('express');
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");
const { validateSignUpData } = require("./utils/validation");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middlewares/auth");

app.use(express.json());
app.use(cookieParser());

app.post("/signup", async (req, res) => {
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

// Login user
app.post("/login", async (req, res) => {
    const { emailId, password } = req.body;

    try {
        // Find the user by emailId
        const user = await User.findOne({ emailId });
        if (!user) {
            return res.status(404).send("Invalid credentials......");
        }
        // Compare the password with the hashed password
        const isPasswordValid = await user.validatePassword(password);
      
        if(isPasswordValid){
        const token = await user.getJWT(); // Generate JWT token
        console.log(token);

        res.cookie("token", token, {expires: new Date(Date.now() + 24 * 60 * 60 * 1000)}); // Set a cookie with the user ID
        res.send("Login successful");
        }
        else{
            throw new Error("Invalid password...");
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Invalid credentials..." + err.message);
    }
});

app.get("/profile", userAuth, async (req, res) => {
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

// Get user by emailId
app.get("/user", async (req, res) => {
    const userEmail = req.body.emailId;

    try {
        const users = await User.find({ emailId: userEmail });
        if (users.length === 0) {
            return res.status(404).send("User not found...");
        }
        res.send(users);
    }
    catch (err) {
        res.status(500).send("Error while fetching user..." + err.message);
    }
});

// Get all users to feed the UI
app.get("/feed", async (req, res) => {
    try {
        const users = await User.find({});
        res.send(users);
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Error while fetching users..." + err.message);
    }
});

app.delete("/user", async (req, res) => {
    const userId = req.body._id;
    try {
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).send("User not found...");
        }
        res.send("User deleted successfully...");
    }
    catch (err) {
        res.status(500).send("Error while deleting user..." + err.message);
    }
});

app.patch("/user/:userId", async (req, res) => {
    const userId = req.params?.userId;
    const updateData = req.body;

    try {
        const ALLOWED_UPDATES = ["age", "gender", "photoUrl", "about", "skills", "password"];
        const isValidOperation = Object.keys(updateData).every((update) =>
            ALLOWED_UPDATES.includes(update)
        );

        if (!isValidOperation) {
            throw new Error("Invalid updates...");
        }

        console.log(updateData?.skills);
        if (updateData?.skills?.length > 10) {
            throw new Error("Skills cannot be more than 10...");
        }
        const result = await User.findByIdAndUpdate(userId, updateData, {
            returnDocument: 'after', // Return the updated document
            runValidators: true, // Run validators on the update
        });
        console.log(result);
        res.send("User updated successfully...");
    }
    catch (err) {
        res.status(500).send("Error while updating user..." + err.message);
    }
});

app.post("/sendConnectionRequest", userAuth, async (req, res) => {

    res.send("Connection request sent successfully by " + req.user.firstName + " " + req.user.lastName);

});

connectDB().then(() => {
    console.log("MongoDB is successfully connected...");
    app.listen(2222, () => {
        console.log('Server is successfully listening on port 2222...');
    });
})
    .catch((err) => {
        console.log("MongoDB connection failed...");
        console.log(err);
    });
