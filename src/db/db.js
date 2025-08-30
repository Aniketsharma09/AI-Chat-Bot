const mongoose = require('mongoose');

function connectToDB(){
    mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('connected to Database');  
    }).catch((err) => {
        console.log('error while connecting to database', err);
    });
}

module.exports = connectToDB;