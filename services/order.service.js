const ApiException = require("../exceptions/api.exception");
const orderModel = require("../models/order.model");
const productService = require("./product.service");

class OrderService {
	async getAll() {
		return await orderModel.find().populate("product").populate("customer");
	}

	async getById(id) {
		const order = await orderModel
			.findById(id)
			.populate("product")
			.populate("customer");
		return order;
	}

	async create(customerId, productId, order) {
		const product = await productService
			.getById(productId)
			.populate("product")
			.populate("customer");
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
		return await orderModel.findByIdAndUpdate(orderId, updatedOrderFields, {
			new: true,
		});
	}

	async remove(orderId) {
		return await orderModel.findByIdAndDelete(orderId);
	}
}

module.exports = new OrderService();
