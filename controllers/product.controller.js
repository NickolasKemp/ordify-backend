const ApiException = require("../exceptions/api.exception");
const productService = require("../services/product.service");
const { validationResult } = require("express-validator");

class ProductController {
	async getAll(req, res, next) {
		try {
			const { searchTerm, page, pageSize } = req.query;
			const products = await productService.getAll(searchTerm, page, pageSize);
			return res.json(products);
		} catch (e) {
			next(e);
		}
	}

	async getById(req, res, next) {
		try {
			const { id } = req.params;
			const product = await productService.getById(id);

			if (!product) {
				throw ApiException.NotFound();
			}

			res.json(product);
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

			const product = req.body;
			const createdProduct = await productService.create(product);
			return res.json(createdProduct);
		} catch (e) {
			next(e);
		}
	}

	async update(req, res, next) {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw ApiException.BadRequest("Validation error", errors.array());
			}

			const updatedProductFields = req.body;
			const productId = req.params.id;

			const updatedProduct = await productService.update(
				productId,
				updatedProductFields,
			);

			if (!updatedProduct) {
				throw ApiException.NotFound();
			}

			return res.json(updatedProduct);
		} catch (e) {
			next(e);
		}
	}

	async addDeliveryOption(req, res, next) {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw ApiException.BadRequest("Validation error", errors.array());
			}

			const newDeliveryOption = req.body;
			const productId = req.params.id;

			const updatedProduct = await productService.addDeliveryOption(
				productId,
				newDeliveryOption,
			);

			if (!updatedProduct) {
				throw ApiException.NotFound();
			}

			return res.json(updatedProduct);
		} catch (e) {
			next(e);
		}
	}

	async deleteDeliveryOption(req, res, next) {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw ApiException.BadRequest("Validation error", errors.array());
			}

			const productId = req.params.productId;
			const deliveryOptionId = req.params.deliveryOptionId;

			const updatedProduct = await productService.deleteDeliveryOption(
				productId,
				deliveryOptionId,
			);
			if (!updatedProduct) {
				throw ApiException.NotFound();
			}

			return res.json(updatedProduct);
		} catch (e) {
			next(e);
		}
	}

	async remove(req, res, next) {
		try {
			const productId = req.params.id;
			const removedProduct = await productService.remove(productId);

			if (!removedProduct) {
				throw ApiException.NotFound();
			}

			return res.json(removedProduct);
		} catch (e) {
			next(e);
		}
	}
}

module.exports = new ProductController();
