"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const app = express();
const path = require("path");
const logger = require("morgan");
// const connectToMongoDB = require("./db/mongodb");
require("dotenv").config();
// Read incoming requests properly
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// logs requests to the server
app.use(logger("dev"));
app.get("/", (req, res) => {
    res.send("Express + TypescriptServer");
});
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);
    // connectToMongoDB();
});
