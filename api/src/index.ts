const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const logger = require("morgan");
const connectToMongoDB = require("./db/mongodb");
const connectToMySQLDatabase = require("./db/mysql");
require("dotenv").config();

//Type imports
import { Express, Request, Response } from "express";

// Read incoming requests properly
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// logs requests to the server
app.use(logger("dev"));

//Cors settings
const allowedOrigins: string[] = ["https://www.domain.com"];

// app.use(cors({
//     origin: (origin, callback) => {
//         if (!origin || allowedOrigins.includes(origin)) {
//             callback(null, true);
//         } else {
//             callback(new Error('Not allowed by CORS'))
//         }
//     },
//     credentials: true
// }))

const categoryRouter = require("./routes/categoryRouter");
app.use("/category", categoryRouter);

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);

    connectToMongoDB();
    connectToMySQLDatabase();
});
