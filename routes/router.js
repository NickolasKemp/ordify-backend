const express = require("express");
const users = require("./user.route");
const products = require("./product.route");
const customers = require("./customer.route");
const orders = require("./order.route");
const auth = require("./auth.route");

const router = express.Router();

router.use("/auth", auth);
router.use("/users", users);
router.use("/products", products);
router.use("/customers", customers);
router.use("/orders", orders);

module.exports = router;
