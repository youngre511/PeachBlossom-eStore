import express from "express";
const app = express();
const path = require("path");
import cors, { CorsOptions } from "cors";
const logger = require("morgan");
const connectToMongoDB = require("./db/mongodb");
import connectToMySQLDatabase from "./db/mysql";
require("dotenv").config();

//Type imports
import { Express, Request, Response } from "express";

// Read incoming requests properly
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// logs requests to the server
app.use(logger("dev"));

//Cors settings
const allowedOrigins: string[] = [
    "https://www.domain.com",
    "http://localhost:3000",
];

const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
};

app.use(cors(corsOptions));

const categoryRouter = require("./routes/categoryRouter");
app.use("/category", categoryRouter);

const productRouter = require("./routes/productRouter");
app.use("/product", productRouter);

const promotionRouter = require("./routes/promotionRouter");
app.use("/promotion", promotionRouter);

const cartRouter = require("./routes/cartRouter");
app.use("/cart", cartRouter);

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);

    connectToMongoDB();
    connectToMySQLDatabase();
});
