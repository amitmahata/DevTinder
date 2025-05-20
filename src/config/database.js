const mongoose = require('mongoose');

const connectDB = async () => {
    await mongoose.connect(
        "mongodb+srv://nodeDev:MongoDb%40123@nodecluster0.5tm0i1j.mongodb.net/devTinder"
    );
}

module.exports = connectDB;