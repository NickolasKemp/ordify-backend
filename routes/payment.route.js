const express = require("express");
const paymentController = require("../controllers/payment.controller");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment processing API (Mocked Stripe)
 */

/**
 * @swagger
 * /payments/create-intent:
 *   post:
 *     summary: Створює Payment Intent
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Сума в доларах
 *               currency:
 *                 type: string
 *                 default: usd
 *     responses:
 *       200:
 *         description: Payment Intent створено
 */
router.post("/create-intent", paymentController.createPaymentIntent);

/**
 * @swagger
 * /payments/confirm:
 *   post:
 *     summary: Підтверджує оплату
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentIntentId:
 *                 type: string
 *               cardDetails:
 *                 type: object
 *                 properties:
 *                   cardNumber:
 *                     type: string
 *                   expMonth:
 *                     type: string
 *                   expYear:
 *                     type: string
 *                   cvc:
 *                     type: string
 *     responses:
 *       200:
 *         description: Оплату підтверджено
 */
router.post("/confirm", paymentController.confirmPayment);

/**
 * @swagger
 * /payments/pay-order:
 *   post:
 *     summary: Оплачує замовлення
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *               cardDetails:
 *                 type: object
 *                 properties:
 *                   cardNumber:
 *                     type: string
 *                   expMonth:
 *                     type: string
 *                   expYear:
 *                     type: string
 *                   cvc:
 *                     type: string
 *     responses:
 *       200:
 *         description: Замовлення оплачено
 */
router.post("/pay-order", paymentController.payOrder);

/**
 * @swagger
 * /payments/status/{orderId}:
 *   get:
 *     summary: Отримує статус оплати замовлення
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Статус оплати
 */
router.get("/status/:orderId", paymentController.getPaymentStatus);

module.exports = router;
