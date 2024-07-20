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
 */
router.get("/main", authMiddleware, statisticsController.getMain);

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Statistics:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the statistic
 *           example: Total
 *         value:
 *           type: number
 *           description: The value of the statistic
 *           example: 5000
 *         isCurrencyValue:
 *           type: boolean
 *           description: Indicates if the value is a currency amount
 *           example: true
 *       required:
 *         - name
 *         - value
 */
