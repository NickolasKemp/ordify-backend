const express = require("express");
const agreementController = require("../controllers/agreement.controller");
const { body } = require("express-validator");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Agreement:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Agreement creation date
 *         ends_at:
 *           type: string
 *           format: date-time
 *           description: Agreement expiration date
 *         customer:
 *           type: string
 *           description: Customer ID reference
 *         legalEntity:
 *           type: string
 *           description: Legal entity ID reference
 *         clientToken:
 *           type: string
 *           description: Unique token for client identification
 *         isActive:
 *           type: boolean
 *           description: Whether agreement is active
 */

/**
 * @swagger
 * tags:
 *   name: Agreement
 *   description: Agreement management API
 * /agreements:
 *   get:
 *     summary: Get all agreements
 *     tags: [Agreement]
 *     responses:
 *       200:
 *         description: List of agreements
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Agreement'
 */
router.get("/", agreementController.getAll);

/**
 * @swagger
 * /agreements/{id}:
 *   get:
 *     summary: Get agreement by ID
 *     tags: [Agreement]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Agreement ID
 *     responses:
 *       200:
 *         description: Agreement details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Agreement'
 *       404:
 *         description: Agreement not found
 */
router.get("/:id", agreementController.getById);

/**
 * @swagger
 * /agreements/customer/{customerId}:
 *   get:
 *     summary: Get active agreement by customer ID
 *     tags: [Agreement]
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Active agreement for customer
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Agreement'
 *       404:
 *         description: No active agreement found
 */
router.get("/customer/:customerId", agreementController.getByCustomer);

/**
 * @swagger
 * /agreements/token/{token}:
 *   get:
 *     summary: Get agreement by client token
 *     tags: [Agreement]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Client token
 *     responses:
 *       200:
 *         description: Agreement details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Agreement'
 *       404:
 *         description: Agreement not found
 */
router.get("/token/:token", agreementController.getByToken);

/**
 * @swagger
 * /agreements/validate/{token}:
 *   get:
 *     summary: Validate a client token
 *     tags: [Agreement]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Client token to validate
 *     responses:
 *       200:
 *         description: Token validation result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                 agreement:
 *                   $ref: '#/components/schemas/Agreement'
 *       404:
 *         description: Invalid or expired token
 */
router.get("/validate/:token", agreementController.validateToken);

/**
 * @swagger
 * /agreements/{customerId}:
 *   post:
 *     summary: Create a new agreement for a customer
 *     tags: [Agreement]
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ends_at:
 *                 type: string
 *                 format: date-time
 *                 description: Agreement expiration date (optional, defaults to 1 year)
 *               legalEntity:
 *                 type: string
 *                 description: Legal entity ID (optional)
 *     responses:
 *       201:
 *         description: Created agreement with client token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Agreement'
 *       400:
 *         description: Customer already has an active agreement
 *       404:
 *         description: Customer not found
 */
router.post("/:customerId", agreementController.create);

/**
 * @swagger
 * /agreements/{id}:
 *   put:
 *     summary: Update an agreement
 *     tags: [Agreement]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Agreement ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ends_at:
 *                 type: string
 *                 format: date-time
 *               legalEntity:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Updated agreement
 *       404:
 *         description: Agreement not found
 */
router.put("/:id", agreementController.update);

/**
 * @swagger
 * /agreements/{id}/deactivate:
 *   patch:
 *     summary: Deactivate an agreement
 *     tags: [Agreement]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Agreement ID
 *     responses:
 *       200:
 *         description: Deactivated agreement
 *       404:
 *         description: Agreement not found
 */
router.patch("/:id/deactivate", agreementController.deactivate);

/**
 * @swagger
 * /agreements/{id}/renew:
 *   patch:
 *     summary: Renew an agreement
 *     tags: [Agreement]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Agreement ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ends_at:
 *                 type: string
 *                 format: date-time
 *                 description: New expiration date (optional, defaults to 1 year from now)
 *     responses:
 *       200:
 *         description: Renewed agreement
 *       404:
 *         description: Agreement not found
 */
router.patch("/:id/renew", agreementController.renew);

/**
 * @swagger
 * /agreements/{id}:
 *   delete:
 *     summary: Delete an agreement
 *     tags: [Agreement]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Agreement ID
 *     responses:
 *       200:
 *         description: Deleted agreement
 *       404:
 *         description: Agreement not found
 */
router.delete("/:id", agreementController.remove);

module.exports = router;
