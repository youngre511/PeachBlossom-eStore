import express from "express";
const app = express();
import cors, { CorsOptions } from "cors";
import logger from "morgan";
import connectToMongoDB from "./db/mongodb.js";
import connectToMySQLDatabase from "./db/mysql.js";
import dotenv from "dotenv";
dotenv.config();

// Router Imports
import categoryRouter from "./routes/categoryRouter.js";
import productRouter from "./routes/productRouter.js";
import promotionRouter from "./routes/promotionRouter.js";
import cartRouter from "./routes/cartRouter.js";
import inventoryRouter from "./routes/inventoryRouter.js";
import orderRouter from "./routes/orderRouter.js";
import authRouter from "./routes/authRoutes.js";

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

app.use("/auth", authRouter);

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);

    connectToMongoDB();
    connectToMySQLDatabase();
});
