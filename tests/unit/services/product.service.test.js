const dbHandler = require("../../setup");
const productService = require("../../../services/product.service");
const ProductModel = require("../../../models/product.model");

describe("ProductService", () => {
	beforeAll(async () => {
		await dbHandler.connect();
	});

	afterAll(async () => {
		await dbHandler.closeDatabase();
	});

	afterEach(async () => {
		await dbHandler.clearDatabase();
	});

	describe("create", () => {
		it("should create a new product", async () => {
			const productData = {
				name: "Test Product",
				description: "Test Description",
				price: 100,
				quantity: 10,
			};

			const product = await productService.create(productData);

			expect(product).toBeDefined();
			expect(product.name).toBe(productData.name);
			expect(product.description).toBe(productData.description);
			expect(product.price).toBe(productData.price);
			expect(product.quantity).toBe(productData.quantity);
		});

		it("should throw error if product with same name exists", async () => {
			const productData = {
				name: "Duplicate Product",
				price: 100,
			};

			await productService.create(productData);

			await expect(productService.create(productData)).rejects.toThrow(
				"Product with this name already exist",
			);
		});

		it("should create product with delivery options", async () => {
			const productData = {
				name: "Product with Delivery",
				price: 150,
				quantity: 5,
				deliveryOptions: [
					{ type: "COURIER", price: 10, period: "1-2 days" },
					{ type: "POSTAL", price: 5, period: "3-5 days" },
				],
			};

			const product = await productService.create(productData);

			expect(product.deliveryOptions).toHaveLength(2);
			expect(product.deliveryOptions[0].type).toBe("COURIER");
		});
	});

	describe("getById", () => {
		it("should return product by id", async () => {
			const created = await ProductModel.create({
				name: "Get By Id Test",
				price: 50,
				quantity: 5,
			});

			const product = await productService.getById(created._id);

			expect(product).toBeDefined();
			expect(product.name).toBe("Get By Id Test");
		});

		it("should return null for non-existent id", async () => {
			const fakeId = "507f1f77bcf86cd799439011";
			const product = await productService.getById(fakeId);

			expect(product).toBeNull();
		});
	});

	describe("getAll", () => {
		beforeEach(async () => {
			// Create test products
			await ProductModel.create([
				{ name: "Apple", price: 1, quantity: 100 },
				{ name: "Banana", price: 2, quantity: 50 },
				{ name: "Orange", price: 3, quantity: 0 }, // Out of stock
			]);
		});

		it("should return all products", async () => {
			const result = await productService.getAll();

			expect(result.products).toHaveLength(3);
			expect(result.totalProducts).toBe(3);
		});

		it("should filter by search term", async () => {
			const result = await productService.getAll("apple");

			expect(result.products).toHaveLength(1);
			expect(result.products[0].name).toBe("Apple");
		});

		it("should support pagination", async () => {
			const result = await productService.getAll(undefined, 0, 2);

			expect(result.products).toHaveLength(2);
			expect(result.totalPages).toBe(2);
		});

		it("should sort out-of-stock products last", async () => {
			const result = await productService.getAll();

			// Out of stock product should be last
			const lastProduct = result.products[result.products.length - 1];
			expect(lastProduct.quantity).toBe(0);
		});
	});

	describe("update", () => {
		it("should update product fields", async () => {
			const product = await ProductModel.create({
				name: "Original Name",
				price: 100,
				quantity: 10,
			});

			const updated = await productService.update(product._id, {
				name: "Updated Name",
				price: 150,
			});

			expect(updated.name).toBe("Updated Name");
			expect(updated.price).toBe(150);
		});

		it("should throw error when updating to existing name", async () => {
			await ProductModel.create({ name: "Existing", price: 50 });
			const product = await ProductModel.create({ name: "Another", price: 60 });

			await expect(
				productService.update(product._id, { name: "Existing" }),
			).rejects.toThrow("Product with this name already exist");
		});
	});

	describe("updateQuantity", () => {
		it("should update only the quantity field", async () => {
			const product = await ProductModel.create({
				name: "Quantity Test",
				price: 100,
				quantity: 10,
			});

			const updated = await productService.updateQuantity(product._id, 5);

			expect(updated.quantity).toBe(5);
			expect(updated.name).toBe("Quantity Test");
		});
	});

	describe("addDeliveryOption", () => {
		it("should add delivery option to product", async () => {
			const product = await ProductModel.create({
				name: "Delivery Test",
				price: 100,
				deliveryOptions: [],
			});

			const updated = await productService.addDeliveryOption(product._id, {
				type: "PICKUP",
				price: 0,
				period: "immediate",
			});

			expect(updated.deliveryOptions).toHaveLength(1);
			expect(updated.deliveryOptions[0].type).toBe("PICKUP");
		});
	});

	describe("deleteDeliveryOption", () => {
		it("should remove delivery option from product", async () => {
			const product = await ProductModel.create({
				name: "Delete Delivery Test",
				price: 100,
				deliveryOptions: [
					{ type: "COURIER", price: 10, period: "1-2 days" },
					{ type: "POSTAL", price: 5, period: "3-5 days" },
				],
			});

			const updated = await productService.deleteDeliveryOption(
				product._id,
				"COURIER",
			);

			expect(updated.deliveryOptions).toHaveLength(1);
			expect(updated.deliveryOptions[0].type).toBe("POSTAL");
		});
	});

	describe("remove", () => {
		it("should delete product", async () => {
			const product = await ProductModel.create({
				name: "To Delete",
				price: 100,
			});

			await productService.remove(product._id);

			const found = await ProductModel.findById(product._id);
			expect(found).toBeNull();
		});
	});
});
