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
