// Import mongoose, setup .env use
import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "../models/mongo/categoryModel.js";
dotenv.config();
mongoose.set("strictQuery", false);

// Create a connection function
const connectToMongoDB = async (): Promise<void> => {
    mongoose
        .connect(process.env.MONGODB_URI as string)
        .then(() => {
            console.log("MONGODB CONNECTED");
        })
        .catch((e: any) => {
            console.log(e);
        });
};

// Export the function
export default connectToMongoDB;
