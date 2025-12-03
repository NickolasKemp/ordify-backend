const paymentService = require("../services/payment.service");
const orderService = require("../services/order.service");
const ApiException = require("../exceptions/api.exception");

class PaymentController {
	/**
	 * Створює Payment Intent для оплати
	 * POST /payments/create-intent
	 */
	async createPaymentIntent(req, res, next) {
		try {
			const { amount, currency } = req.body;

			if (!amount || amount <= 0) {
				throw ApiException.BadRequest("Invalid amount");
			}

			const paymentData = await paymentService.createPaymentIntent(
				amount,
				currency,
			);

			return res.json(paymentData);
		} catch (e) {
			next(e);
		}
	}

	/**
	 * Підтверджує оплату
	 * POST /payments/confirm
	 */
	async confirmPayment(req, res, next) {
		try {
			const { paymentIntentId, cardDetails } = req.body;

			if (!paymentIntentId) {
				throw ApiException.BadRequest("Payment intent ID is required");
			}

			if (!cardDetails || !cardDetails.cardNumber) {
				throw ApiException.BadRequest("Card details are required");
			}

			const result = await paymentService.confirmPayment(
				paymentIntentId,
				cardDetails,
			);

			if (!result.success) {
				throw ApiException.BadRequest(`Payment failed: ${result.error}`);
			}

			return res.json(result);
		} catch (e) {
			next(e);
		}
	}

	/**
	 * Оплачує замовлення (створює та підтверджує платіж за один запит)
	 * POST /payments/pay-order
	 */
	async payOrder(req, res, next) {
		try {
			const { orderId, cardDetails } = req.body;

			if (!orderId) {
				throw ApiException.BadRequest("Order ID is required");
			}

			if (!cardDetails || !cardDetails.cardNumber) {
				throw ApiException.BadRequest("Card details are required");
			}

			// Отримуємо замовлення
			const order = await orderService.getById(orderId);
			if (!order) {
				throw ApiException.NotFound("Order not found");
			}

			// Створюємо Payment Intent
			const paymentIntent = await paymentService.createPaymentIntent(
				order.price,
			);

			// Підтверджуємо оплату
			const paymentResult = await paymentService.confirmPayment(
				paymentIntent.paymentIntentId,
				cardDetails,
			);

			if (!paymentResult.success) {
				// Оновлюємо статус замовлення як failed
				await orderService.update(orderId, {
					paymentStatus: "failed",
				});
				throw ApiException.BadRequest(`Payment failed: ${paymentResult.error}`);
			}

			// Оновлюємо замовлення з інформацією про оплату
			const updatedOrder = await orderService.update(orderId, {
				paymentStatus: "paid",
				paymentIntentId: paymentIntent.paymentIntentId,
				paidAt: new Date(),
			});

			return res.json({
				success: true,
				order: updatedOrder,
				payment: {
					paymentIntentId: paymentIntent.paymentIntentId,
					status: "succeeded",
				},
			});
		} catch (e) {
			next(e);
		}
	}

	/**
	 * Отримує статус оплати замовлення
	 * GET /payments/status/:orderId
	 */
	async getPaymentStatus(req, res, next) {
		try {
			const { orderId } = req.params;

			const order = await orderService.getById(orderId);
			if (!order) {
				throw ApiException.NotFound("Order not found");
			}

			return res.json({
				orderId: order._id,
				paymentStatus: order.paymentStatus || "pending",
				paymentIntentId: order.paymentIntentId,
				paidAt: order.paidAt,
			});
		} catch (e) {
			next(e);
		}
	}
}

module.exports = new PaymentController();
