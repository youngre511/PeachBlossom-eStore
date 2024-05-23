const express = require("express");
import {Express, Request, Response} from "express";
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


app.get("/api/", (req: Request, res: Response) => {
    res.send("Express + TypescriptServer")
});




const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);

    // connectToMongoDB();
});
