const ApiException = require("../exceptions/api.exception");
const productModel = require("../models/product.model");

class ProductService {
	async getAll(searchTerm, page = 0, pageSize = 10) {
		page = parseInt(page);
		pageSize = parseInt(pageSize);

		let startIndex = (page - 1) * pageSize + pageSize;
		if (page === 0) startIndex = 0;
		if (page === 1) startIndex = pageSize;

		const pipeline = [];

		if (!(searchTerm === "undefined") && searchTerm) {
			pipeline.push({
				$match: {
					$or: [
						{ name: { $regex: searchTerm, $options: "i" } },
						{ description: { $regex: searchTerm, $options: "i" } },
					],
				},
			});
		}

		const baseSort = [
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
		];
		pipeline.push(...baseSort);

		const searchedProducts = await productModel.aggregate(pipeline);
		const totalPages = Math.ceil(searchedProducts.length / pageSize);

		if (page !== undefined && pageSize !== undefined) {
			const pagination = [{ $skip: startIndex }, { $limit: pageSize }];
			pipeline.push(...pagination);
		}

		const products = await productModel.aggregate(pipeline);

		return { products, totalPages, totalProducts: searchedProducts.length };
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
