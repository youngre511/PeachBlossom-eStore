import express from "express";
const app = express();
import path from "path";
import cors, { CorsOptions } from "cors";
import logger from "morgan";
import connectToMongoDB from "./db/mongodb";
import connectToMySQLDatabase from "./db/mysql";
import dotenv from "dotenv";
dotenv.config();

// Router Imports
import categoryRouter from "./routes/categoryRouter";
import productRouter from "./routes/productRouter";
import promotionRouter from "./routes/promotionRouter";
import cartRouter from "./routes/cartRouter";
import inventoryRouter from "./routes/inventoryRouter";
import orderRouter from "./routes/orderRouter";

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

app.use("/category", categoryRouter);

app.use("/product", productRouter);

app.use("/promotion", promotionRouter);

app.use("/cart", cartRouter);

app.use("/inventory", inventoryRouter);

app.use("/order", orderRouter);

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);

    connectToMongoDB();
    connectToMySQLDatabase();
});
