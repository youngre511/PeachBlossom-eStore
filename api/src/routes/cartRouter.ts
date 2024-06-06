const cartRouter = require("express").Router();

cartRouter.get("/cartId/:cartId");

cartRouter.get("/customerId/:customerId");

cartRouter.post("/create");

cartRouter.put("/add-to-cart");

module.exports = cartRouter;
