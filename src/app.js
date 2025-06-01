const express = require('express');
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

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
