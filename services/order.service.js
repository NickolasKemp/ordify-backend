const ApiException = require("../exceptions/api.exception");
const orderModel = require("../models/order.model");
const productService = require("./product.service");
const agreementService = require("./agreement.service");
const customerService = require("./customer.service");

class OrderService {
	async getAll() {
		return await orderModel
			.find()
			.populate("product")
			.populate("customer")
			.populate("agreement");
	}

	async getById(id) {
		const order = await orderModel
			.findById(id)
			.populate("product")
			.populate("customer")
			.populate("agreement");
		return order;
	}

	/**
	 * Create order with agreement (first order scenario)
	 * Creates a new agreement and returns the client token for future orders
	 */
	async createWithAgreement(customerId, productId, order, agreementData = {}) {
		const product = await productService.getById(productId);
		const updatedQuantity = product.quantity - order.quantity;

		if (order.quantity <= 0) {
			throw ApiException.BadRequest("Amount can't be less or equal to zero");
		}

		if (updatedQuantity < 0) {
			throw ApiException.BadRequest("Amount of products is less than in order");
		}

		// Check if customer already has an active agreement
		const existingAgreement =
			await agreementService.getActiveAgreementByCustomer(customerId);
		if (existingAgreement) {
			throw ApiException.BadRequest(
				"Customer already has an active agreement. Use the client token to create orders.",
			);
		}

		// Create new agreement for first order
		const agreement = await agreementService.create(customerId, agreementData);

		// Create the order linked to the agreement
		const createdOrder = await orderModel.create({
			product: productId,
			customer: customerId,
			agreement: agreement._id,
			...order,
		});

		await productService.updateQuantity(product._id, updatedQuantity);

		// Return order with agreement and client token
		const populatedOrder = await orderModel
			.findById(createdOrder._id)
			.populate("product")
			.populate("customer")
			.populate("agreement");

		return {
			order: populatedOrder,
			clientToken: agreement.clientToken,
			message: "Agreement created. Save this client token for future orders.",
		};
	}

	/**
	 * Create order using client token (subsequent orders)
	 * Validates the token and creates order under existing agreement
	 */
	async createWithToken(clientToken, productId, order) {
		// Validate the client token
		const agreement = await agreementService.validateClientToken(clientToken);
		if (!agreement) {
			throw ApiException.BadRequest("Invalid or expired client token");
		}

		const product = await productService.getById(productId);
		const updatedQuantity = product.quantity - order.quantity;

		if (order.quantity <= 0) {
			throw ApiException.BadRequest("Amount can't be less or equal to zero");
		}

		if (updatedQuantity < 0) {
			throw ApiException.BadRequest("Amount of products is less than in order");
		}

		// Create order linked to the agreement
		const createdOrder = await orderModel.create({
			product: productId,
			customer: agreement.customer._id,
			agreement: agreement._id,
			...order,
		});

		await productService.updateQuantity(product._id, updatedQuantity);

		return await orderModel
			.findById(createdOrder._id)
			.populate("product")
			.populate("customer")
			.populate("agreement");
	}

	/**
	 * Legacy create method - still works for backward compatibility
	 */
	async create(customerId, productId, order) {
		const product = await productService.getById(productId);
		const updatedQuantity = product.quantity - order.quantity;

		if (order.quantity <= 0) {
			throw ApiException.BadRequest("Amount can't be less or equal to zero");
		}

		if (updatedQuantity < 0) {
			throw ApiException.BadRequest("Amount of products is less than in order");
		}

		const createdOrder = await orderModel.create({
			product: productId,
			customer: customerId,
			...order,
		});

		await productService.updateQuantity(product._id, updatedQuantity);

		return createdOrder;
	}

	async update(orderId, updatedOrderFields) {
		// If status is being updated to "completed", set completedAt timestamp
		if (updatedOrderFields.status === "completed") {
			updatedOrderFields.completedAt = new Date();
		}

		return await orderModel
			.findByIdAndUpdate(orderId, updatedOrderFields, {
				new: true,
			})
			.populate("product")
			.populate("customer");
	}

	async remove(orderId) {
		return await orderModel.findByIdAndDelete(orderId);
	}
}

module.exports = new OrderService();
