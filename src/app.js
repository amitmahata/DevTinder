const express = require('express');
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");

app.use(express.json());

app.post("/signup", async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save();
        res.send("User added successfully...");
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Error while adding user..." + err.message);
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
