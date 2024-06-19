const cartRouter = require("express").Router();
const {
    getCartById,
    addToCart,
    deleteFromCart,
    updateItemQuantity,
} = require("../controllers/cartController");

function dummyFunc() {}

cartRouter.get("/cartId/:cartId", getCartById);

cartRouter.get("/customerId/:customerId", dummyFunc);

cartRouter.put("/add-to-cart", addToCart);

cartRouter.put("/update-quantity", updateItemQuantity);

cartRouter.put("/delete-from-cart", deleteFromCart);

module.exports = cartRouter;
