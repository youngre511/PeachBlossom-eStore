// Import mongoose, setup .env use
const mongoose = require("mongoose");
require("dotenv").config();
mongoose.set("strictQuery", false);

// Create a connection function
async function connectToMongoDB(): Promise<void> {
    mongoose
        .connect(process.env.MONGODB_URI as string)
        .then(() => {
            console.log("MONGODB CONNECTED");
        })
        .catch((e: any) => {
            console.log(e);
        });
}

// Export the function
module.exports = connectToMongoDB;
