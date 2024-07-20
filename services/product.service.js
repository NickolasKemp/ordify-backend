const ApiException = require("../exceptions/api.exception");
const productModel = require("../models/product.model");

class ProductService {
	async getAll() {
		return await productModel.aggregate([
			{
				$addFields: {
					sortField: {
						$cond: { if: { $eq: ["$quantity", 0] }, then: 1, else: 0 },
					},
				},
			},
			{
				$sort: {
					sortField: 1,
					createdAt: -1,
				},
			},
			{
				$project: {
					sortField: 0,
				},
			},
		]);
	}

	async getById(id) {
		const product = await productModel.findById(id);
		return product;
	}

	async create(product) {
		const same = await productModel.findOne({ name: product.name });

		if (!product.name && same) {
			throw ApiException.BadRequest(
				"There is already an empty product. Fill it or delete to create a new one",
			);
		}

		if (same) {
			throw ApiException.BadRequest("Product with this name already exist");
		}

		return await productModel.create(product);
	}

	async update(productId, updatedProductFields) {
		const same = await productModel.findOne({
			name: updatedProductFields.name,
		});

		if (same) {
			throw ApiException.BadRequest("Product with this name already exist");
		}

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

	async addDeliveryOption(productId, deliveryOption) {
		return await productModel.findByIdAndUpdate(
			productId,
			{ $push: { deliveryOptions: deliveryOption } },
			{ new: true },
		);
	}

	async deleteDeliveryOption(productId, deliveryOptionId) {
		return await productModel.findByIdAndUpdate(
			productId,
			{ $pull: { deliveryOptions: { type: deliveryOptionId } } },
			{ new: true },
		);
	}

	async remove(productId) {
		return await productModel.findOneAndDelete({ _id: productId });
	}
}

module.exports = new ProductService();
