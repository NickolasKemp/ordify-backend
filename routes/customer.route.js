const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const customerController = require("../controllers/customer.controller");
const { body } = require("express-validator");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Customer
 *   description: The customer managing API
 * /customers:
 *   get:
 *     summary: Get customers
 *     tags: [Customer]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: The customers.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Customer'
 *       500:
 *         description: Internal server error
 *
 */
router.get("/", customerController.getAll);

/**
 * @swagger
 * tags:
 *   name: Customer
 *   description: The customer managing API
 * /customers/{id}:
 *   get:
 *     summary: Get a customer
 *     tags: [Customer]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The customer ID
 *     responses:
 *       200:
 *         description: The customer.
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 *
 */
router.get("/:id", customerController.getById);

/**
 * @swagger
 * tags:
 *   name: Customer
 *   description: The customer managing API
 * /customers:
 *   post:
 *     summary: Create a new customer
 *     tags: [Customer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       200:
 *         description: The created customer.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
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
	body("street").isString(),
	body("city").isString(),
	body("state").isString(),
	body("zip").isInt(),
	body("phone").isString().isMobilePhone(),
	body("contactPerson").isString(),

	customerController.create,
);

/**
 * @swagger
 * tags:
 *   name: Customer
 *   description: The customer managing API
 * /customers/{id}:
 *   put:
 *     summary: Update a customer
 *     tags: [Customer]
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
 *                 description: The name of the customer
 *             example:
 *               name: Example Customer
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The customer ID
 *     responses:
 *       200:
 *         description: The updated customer.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
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
router.put("/:id", customerController.update);

/**
 * @swagger
 * tags:
 *   name: Customer
 *   description: The customer managing API
 * /customers/{id}:
 *   delete:
 *     summary: Delete a customer
 *     tags: [Customer]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The customer ID
 *     responses:
 *       200:
 *         description: The deleted customer.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 *
 */
router.delete("/:id", customerController.remove);

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Customer:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the customer
 *         name:
 *           type: string
 *           description: The name of the customer
 *         address:
 *           type: string
 *           description: The address of the customer
 *         phone:
 *           type: string
 *           description: The phone number of the customer
 *         contactPerson:
 *           type: string
 *           description: The contact person for the customer
 *       example:
 *         id: 5f1d7f3b0b1e8a1b2c3d4e5f
 *         name: Example Customer
 *         address: 123 Example Street, Example City, EX 12345
 *         phone: "+1234567890"
 *         contactPerson: John Doe
 */
