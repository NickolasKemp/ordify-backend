const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const orderController = require("../controllers/order.controller");
const { body } = require("express-validator");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Order
 *   description: The order managing API
 * /orders:
 *   get:
 *     summary: Get orders
 *     tags: [Order]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: The orders.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       500:
 *         description: Internal server error
 *
 */
router.get("/", orderController.getAll);

/**
 * @swagger
 * tags:
 *   name: Order
 *   description: The order managing API
 * /orders/{id}:
 *   get:
 *     summary: Get a order
 *     tags: [Order]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The order ID
 *     responses:
 *       200:
 *         description: The order.
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/Order'
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 *
 */
router.get("/:id", orderController.getById);

/**
 * @swagger
 * tags:
 *   name: Order
 *   description: The order managing API
 * /orders/{customerId}/{productId}:
 *   post:
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The customer ID
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     summary: Create a new order
 *     tags: [Order]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       200:
 *         description: The created order.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *
 */
router.post(
	"/:customerId/:productId",
	body("quantity").isInt(),
	body("price").isInt(),
	orderController.create,
);

/**
 * @swagger
 * tags:
 *   name: Order
 *   description: The order managing API
 * /orders/{id}:
 *   put:
 *     summary: Update a order
 *     tags: [Order]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the order
 *             example:
 *               name: Example Order
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The order ID
 *     responses:
 *       200:
 *         description: The updated order.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 *
 */
router.put("/:id", orderController.update);

/**
 * @swagger
 * tags:
 *   name: Order
 *   description: The order managing API
 * /orders/{id}:
 *   delete:
 *     summary: Delete a order
 *     tags: [Order]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The order ID
 *     responses:
 *       200:
 *         description: The deleted order.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 *
 */
router.delete("/:id", orderController.remove);

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     DeliveryOption:
 *       type: object
 *       required:
 *         - type
 *         - price
 *         - period
 *       properties:
 *         type:
 *           type: string
 *           description: The type of delivery
 *           enum:
 *             - COURIER
 *             - POSTAL
 *             - PICKUP
 *           default: POSTAL
 *         price:
 *           type: number
 *           format: double
 *           description: The price of delivery
 *         period:
 *           type: string
 *           description: The delivery period
 *           default: Immediate
 *     Product:
 *       type: object
 *       required:
 *         - createdAt
 *         - price
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the product
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the product was created
 *         name:
 *           type: string
 *           description: The name of the product
 *         description:
 *           type: string
 *           description: The description of the product
 *         price:
 *           type: number
 *           format: double
 *           description: The price of the product
 *         image:
 *           type: string
 *           description: URL of the product image
 *         deliveryOptions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DeliveryOption'
 *           description: Array of delivery options for the product
 *         quantity:
 *           type: number
 *           description: The quantity of the product available
 *       example:
 *         id: 5f1d7f3b0b1e8a1b2c3d4e5f
 *         createdAt: 2023-07-02T10:30:00.000Z
 *         name: Example Product
 *         description: This is an example product.
 *         price: 19.99
 *         image: "https://example.com/image1.jpg"
 *         deliveryOptions:
 *           - type: COURIER
 *             price: 5.00
 *             period: 3-5 business days
 *           - type: POSTAL
 *             price: 3.00
 *             period: 5-7 business days
 *         quantity: 10
 *     Customer:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the customer
 *         email:
 *           type: string
 *           description: The email of the customer
 *         password:
 *           type: string
 *           description: The password of the customer
 *         isActivated:
 *           type: boolean
 *           description: Activation status of the customer
 *         activationLink:
 *           type: string
 *           description: Activation link of the customer
 *       example:
 *         id: 5f1d7f3b0b1e8a1b2c3d4e5f
 *         email: customer@example.com
 *         password: password1234
 *         isActivated: true
 *         activationLink: 5f1d7f3b0b1e8a1b2c3d4e5f
 *     Order:
 *       type: object
 *       required:
 *         - created_at
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the order
 *         created_at:
 *           type: string
 *           format: date
 *           description: The date the order was created
 *         quantity:
 *           type: number
 *           description: The quantity of the order
 *         deliveryWay:
 *           type: string
 *           description: The way the product is delivered
 *           enum:
 *             - COURIER
 *             - POSTAL
 *             - PICKUP
 *         price:
 *           type: number
 *           format: double
 *           description: The price of the order
 *         product:
 *           $ref: '#/components/schemas/Product'
 *           description: The product in the order
 *         customer:
 *           $ref: '#/components/schemas/Customer'
 *           description: The customer who placed the order
 *       example:
 *         id: 5f1d7f3b0b1e8a1b2c3d4e5f
 *         created_at: 2023-07-02T10:30:00.000Z
 *         quantity: 2
 *         price: 39.98
 *         product:
 *           id: 5f1d7f3b0b1e8a1b2c3d4e5f
 *           createdAt: 2023-07-02T10:30:00.000Z
 *           name: Example Product
 *           description: This is an example product.
 *           price: 19.99
 *           image: "https://example.com/image1.jpg"
 *           deliveryOptions:
 *             - type: COURIER
 *               price: 5.00
 *               period: 3-5 business days
 *             - type: POSTAL
 *               price: 3.00
 *               period: 5-7 business days
 *           quantity: 10
 *         customer:
 *           id: 5f1d7f3b0b1e8a1b2c3d4e5f
 *           email: customer@example.com
 *           password: password1234
 *           isActivated: true
 *           activationLink: 5f1d7f3b0b1e8a1b2c3d4e5f
 *         deliveryWay: POSTAL
 */
