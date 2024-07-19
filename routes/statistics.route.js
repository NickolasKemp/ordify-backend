const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const statisticsController = require("../controllers/statistics.controller");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Statistics
 *   description: The statistics managing API
 * /statistics/main:
 *   get:
 *     summary: Get statistics
 *     tags: [Statistics]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: The statistics.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Statistics'
 *       500:
 *         description: Internal server error
 *
 *
 */
router.get("/main", authMiddleware, statisticsController.getMain);

module.exports = router;

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Statistics:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: Statistics email
 *         password:
 *           type: string
 *           description: Statistics password
 *           format: password
 *       example:
 *         email: statistics@example.com
 *         password: password1234
 */
