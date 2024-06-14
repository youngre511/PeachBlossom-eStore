const cartRouter = require("express").Router();

function dummyFunc() {}

cartRouter.get("/cartId/:cartId", dummyFunc);

cartRouter.get("/customerId/:customerId", dummyFunc);

cartRouter.post("/create", dummyFunc);

cartRouter.put("/add-to-cart", dummyFunc);

module.exports = cartRouter;
