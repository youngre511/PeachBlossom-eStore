const cartRouter = require("express").Router();
const {
    getCartById,
    addItemToCart,
    removeItemFromCart,
} = require("../controllers/cartController");

function dummyFunc() {}

cartRouter.get("/cartId/:cartId", getCartById);

cartRouter.get("/customerId/:customerId", dummyFunc);

cartRouter.put("/add-to-cart", addItemToCart);

cartRouter.put("/remove-from-cart", removeItemFromCart);

module.exports = cartRouter;
