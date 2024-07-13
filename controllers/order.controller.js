const { validationResult } = require("express-validator");
const orderService = require("../services/order.service");
const ApiException = require("../exceptions/api.exception");

class OrderController {
	async getAll(req, res, next) {
		try {
			const orders = await orderService.getAll();
			return res.json(orders);
		} catch (e) {
			next(e);
		}
	}

	async getById(req, res, next) {
		try {
			const { id } = req.params;
			const order = await orderService.getById(id);

			if (!order) {
				throw ApiException.NotFound();
			}

			res.json(order);
		} catch (e) {
			next(e);
		}
	}

	async create(req, res, next) {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw ApiException.BadRequest("Validation error", errors.array());
			}

			const { customerId, productId } = req.params;

			const order = req.body;
			const createdOrder = await orderService.create(
				customerId,
				productId,
				order,
			);
			return res.json(createdOrder);
		} catch (e) {
			next(e);
		}
	}

	async update(req, res, next) {
		try {
			const updatedOrderFields = req.body;
			const orderId = req.params.id;
			const updatedOrder = await orderService.update(
				orderId,
				updatedOrderFields,
			);

			if (!updatedOrder) {
				throw ApiException.NotFound();
			}

			return res.json(updatedOrder);
		} catch (e) {
			next(e);
		}
	}

	async remove(req, res, next) {
		try {
			const orderId = req.params.id;
			const removedOrder = await orderService.remove(orderId);

			if (!removedOrder) {
				throw ApiException.NotFound();
			}

			return res.json(removedOrder);
		} catch (e) {
			next(e);
		}
	}
}

module.exports = new OrderController();
