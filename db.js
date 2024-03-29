const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
const mongoose = require('mongoose');
// const mongoURI = "mongodb://localhost:27017/inotebook";
const mongoURI = process.env.url;

const connectToMongo = () => {

    mongoose.connect(mongoURI , ()=>{
        console.log("Connected to Mongo successfully");
    })
}


module.exports = connectToMongo;
