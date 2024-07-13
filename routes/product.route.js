const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const productController = require("../controllers/product.controller");
const { body } = require("express-validator");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Product
 *   description: The product managing API
 * /products:
 *   get:
 *     summary: Get products
 *     tags: [Product]
 *     responses:
 *       200:
 *         description: The products.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Internal server error
 *
 */
router.get("/", productController.getAll);

/**
 * @swagger
 * tags:
 *   name: Product
 *   description: The product managing API
 * /products/{id}:
 *   get:
 *     summary: Get a product
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     responses:
 *       200:
 *         description: The product.
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/Product'
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 *
 */
router.get("/:id", productController.getById);

/**
 * @swagger
 * tags:
 *   name: Product
 *   description: The product managing API
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Product]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: The created product.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *
 */
router.post(
	"/",
	body("name").isString(),
	body("description").isString().optional(),
	body("images").isArray().optional(),
	body("price").isInt(),
	body("deliveryPrice").isInt(),
	body("deliveryPeriod").isString(),
	body("quantity").isInt(),
	authMiddleware,
	productController.create,
);

/**
 * @swagger
 * tags:
 *   name: Product
 *   description: The product managing API
 * /products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Product]
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
 *                 description: The name of the product
 *             example:
 *               name: Example Product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     responses:
 *       200:
 *         description: The updated product.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
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
router.put("/:id", authMiddleware, productController.update);

/**
 * @swagger
 * tags:
 *   name: Product
 *   description: The product managing API
 * /products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Product]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     responses:
 *       200:
 *         description: The deleted product.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 *
 */
router.delete("/:id", productController.remove);

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - created_at
 *         - name
 *         - price
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the product
 *         created_at:
 *           type: string
 *           format: date
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
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of image URLs for the product
 *         deliveryWay:
 *           type: string
 *           description: The way the product is delivered
 *           enum:
 *             - COURIER
 *             - POSTAL
 *             - PICKUP
 *           default: PICKUP
 *         deliveryPrice:
 *           type: number
 *           format: double
 *           description: The price of delivery
 *         deliveryPeriod:
 *           type: string
 *           description: The delivery period
 *       example:
 *         id: 5f1d7f3b0b1e8a1b2c3d4e5f
 *         created_at: 2023-07-02T10:30:00.000Z
 *         name: Example Product
 *         description: This is an example product.
 *         price: 19.99
 *         images: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
 *         deliveryWay: COURIER
 *         deliveryPrice: 5.00
 *         deliveryPeriod: 3-5 business days
 */
