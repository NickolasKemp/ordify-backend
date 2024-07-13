const productModel = require("../models/product.model");

class ProductService {
	async getAll() {
		return await productModel.find();
	}

	async getById(id) {
		const product = await productModel.findById(id);
		return product;
	}

	async create(product) {
		return await productModel.create(product);
	}

	async update(productId, updatedProductFields) {
		return await productModel.findByIdAndUpdate(
			productId,
			updatedProductFields,
			{ new: true },
		);
	}

	async updateQuantity(productId, updatedQuantity) {
		return await productModel.findByIdAndUpdate(
			productId,
			{ quantity: updatedQuantity },
			{ new: true },
		);
	}

	async remove(productId) {
		return await productModel.findByIdAndDelete(productId);
	}
}

module.exports = new ProductService();
