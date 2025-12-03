/**
 * Mocked Stripe Payment Service
 * Імітує роботу Stripe API для тестування
 */

class PaymentService {
	/**
	 * Створює мокований Payment Intent
	 * @param {number} amount - Сума в доларах
	 * @param {string} currency - Валюта (default: usd)
	 * @returns {Promise<{clientSecret: string, paymentIntentId: string}>}
	 */
	async createPaymentIntent(amount, currency = "usd") {
		// Імітація затримки API
		await this.simulateDelay(500);

		const paymentIntentId = this.generatePaymentIntentId();
		const clientSecret = `${paymentIntentId}_secret_${this.generateRandomString(
			24,
		)}`;

		return {
			clientSecret,
			paymentIntentId,
			amount: Math.round(amount * 100), // Stripe використовує центи
			currency,
			status: "requires_payment_method",
		};
	}

	/**
	 * Підтверджує оплату (мокане)
	 * @param {string} paymentIntentId - ID платіжного наміру
	 * @param {object} cardDetails - Дані картки
	 * @returns {Promise<{success: boolean, paymentIntentId: string, status: string}>}
	 */
	async confirmPayment(paymentIntentId, cardDetails) {
		// Імітація затримки обробки платежу
		await this.simulateDelay(1000);

		// Валідація тестових карток Stripe
		const validationResult = this.validateTestCard(cardDetails.cardNumber);

		if (!validationResult.valid) {
			return {
				success: false,
				paymentIntentId,
				status: "failed",
				error: validationResult.error,
			};
		}

		return {
			success: true,
			paymentIntentId,
			status: "succeeded",
			paidAt: new Date(),
		};
	}

	/**
	 * Отримує статус платежу
	 * @param {string} paymentIntentId - ID платіжного наміру
	 * @returns {Promise<{status: string}>}
	 */
	async getPaymentStatus(paymentIntentId) {
		await this.simulateDelay(200);

		// У реальному Stripe це б запитувало статус з API
		return {
			paymentIntentId,
			status: "succeeded",
		};
	}

	/**
	 * Валідація тестових карток Stripe
	 * https://stripe.com/docs/testing
	 */
	validateTestCard(cardNumber) {
		const testCards = {
			4242424242424242: { valid: true, brand: "visa" },
			4000056655665556: { valid: true, brand: "visa_debit" },
			5555555555554444: { valid: true, brand: "mastercard" },
			5200828282828210: { valid: true, brand: "mastercard_debit" },
			378282246310005: { valid: true, brand: "amex" },
			// Картки для тестування помилок
			4000000000000002: { valid: false, error: "card_declined" },
			4000000000009995: { valid: false, error: "insufficient_funds" },
			4000000000000069: { valid: false, error: "expired_card" },
			4000000000000127: { valid: false, error: "incorrect_cvc" },
		};

		const cleanNumber = cardNumber.replace(/\s/g, "");

		if (testCards[cleanNumber]) {
			return testCards[cleanNumber];
		}

		// Для будь-якої іншої картки - успішно (для тестування)
		if (cleanNumber.length >= 13 && cleanNumber.length <= 19) {
			return { valid: true, brand: "unknown" };
		}

		return { valid: false, error: "invalid_card_number" };
	}

	// Допоміжні методи

	generatePaymentIntentId() {
		return `pi_${this.generateRandomString(24)}`;
	}

	generateRandomString(length) {
		const chars =
			"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		let result = "";
		for (let i = 0; i < length; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
	}

	simulateDelay(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
}

module.exports = new PaymentService();
