const inventoryRouter = require("express").Router();
const {
    holdStock,
    releaseStock,
} = require("../controllers/inventoryController");

inventoryRouter.put("/holdStock", holdStock);

inventoryRouter.put("/releaseStock", releaseStock);

module.exports = inventoryRouter;
