import express from "express";
const app = express();
import cors, { CorsOptions } from "cors";
import logger from "morgan";
import mongoSanitize from "express-mongo-sanitize";
import connectToMongoDB from "./db/mongodb.js";
import connectToMySQLDatabase from "./db/mysql.js";
import dotenv from "dotenv";
import "reflect-metadata";
import cookieParser from "cookie-parser";
dotenv.config();

// Router Imports
import categoryRouter from "./routes/categoryRouter.js";
import productRouter from "./routes/productRouter.js";
import promotionRouter from "./routes/promotionRouter.js";
import cartRouter from "./routes/cartRouter.js";
import inventoryRouter from "./routes/inventoryRouter.js";
import orderRouter from "./routes/orderRouter.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import analyticsRouter from "./routes/analyticsRoutes.js";
import activityRouter from "./routes/activityRoutes.js";

//Cors settings
const allowedOrigins: string[] = [
    "https://pb.ryanyoung.codes",
    "https://admin.pb.ryanyoung.codes",
    "http://localhost:3000",
    "http://admin.localhost:3000",
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

// Read incoming requests properly
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// logs requests to the server
app.use(logger("dev"));

// parse cookies
app.use(cookieParser());

// sanitize requests for mongoDB
app.use(mongoSanitize());

app.get("/set-test-cookie", (req, res) => {
    res.cookie("test", "value", {
        path: "/",
        domain: "localhost",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.send("Cookie set");
});

app.get("/test-cookies", (req, res) => {
    res.send(JSON.stringify(req.cookies));
});

app.use("/category", categoryRouter);

app.use("/product", productRouter);

app.use("/promotion", promotionRouter);

app.use("/cart", cartRouter);

app.use("/inventory", inventoryRouter);

app.use("/order", orderRouter);

app.use("/auth", authRouter);

app.use("/user", userRouter);

app.use("/analytics", analyticsRouter);

app.use("/activity", activityRouter);

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);

    connectToMongoDB();
    connectToMySQLDatabase();
});
