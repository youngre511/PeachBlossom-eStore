const cartRouter = require("express").Router();
const {
    getCartById,
    addItemToCart,
    deleteItemFromCart,
    updateItemQuantity,
} = require("../controllers/cartController");

function dummyFunc() {}

cartRouter.get("/cartId/:cartId", getCartById);

cartRouter.get("/customerId/:customerId", dummyFunc);

cartRouter.put("/add-to-cart", addItemToCart);

cartRouter.put("/update-quantity", updateItemQuantity);

cartRouter.put("/delete-from-cart", deleteItemFromCart);

module.exports = cartRouter;
