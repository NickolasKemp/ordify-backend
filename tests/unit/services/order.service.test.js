const dbHandler = require("../../setup");
const orderService = require("../../../services/order.service");
const ProductModel = require("../../../models/product.model");
const CustomerModel = require("../../../models/customer.model");
const OrderModel = require("../../../models/order.model");

describe("OrderService", () => {
	let testProduct;
	let testCustomer;

	beforeAll(async () => {
		await dbHandler.connect();
	});

	afterAll(async () => {
		await dbHandler.closeDatabase();
	});

	beforeEach(async () => {
		// Create test product and customer for each test
		testProduct = await ProductModel.create({
			name: "Test Product",
			price: 100,
			quantity: 50,
		});

		testCustomer = await CustomerModel.create({
			name: "Test Customer",
			city: "Test City",
			phone: "1234567890",
		});
	});

	afterEach(async () => {
		await dbHandler.clearDatabase();
	});

	describe("create", () => {
		it("should create a new order", async () => {
			const orderData = {
				quantity: 5,
				price: 500,
				deliveryWay: "COURIER",
			};

			const order = await orderService.create(
				testCustomer._id,
				testProduct._id,
				orderData,
			);

			expect(order).toBeDefined();
			expect(order.quantity).toBe(5);
			expect(order.price).toBe(500);
			expect(order.deliveryWay).toBe("COURIER");
		});

		it("should reduce product quantity after order", async () => {
			const orderData = {
				quantity: 10,
				price: 1000,
			};

			await orderService.create(testCustomer._id, testProduct._id, orderData);

			const updatedProduct = await ProductModel.findById(testProduct._id);
			expect(updatedProduct.quantity).toBe(40); // 50 - 10
		});

		it("should throw error if order quantity exceeds available stock", async () => {
			const orderData = {
				quantity: 100, // More than 50 available
				price: 10000,
			};

			await expect(
				orderService.create(testCustomer._id, testProduct._id, orderData),
			).rejects.toThrow("Amount of products is less than in order");
		});

		it("should throw error if order quantity is zero or negative", async () => {
			const orderData = {
				quantity: 0,
				price: 0,
			};

			await expect(
				orderService.create(testCustomer._id, testProduct._id, orderData),
			).rejects.toThrow("Amount can't be less or equal to zero");
		});

		it("should throw error for negative quantity", async () => {
			const orderData = {
				quantity: -5,
				price: 0,
			};

			await expect(
				orderService.create(testCustomer._id, testProduct._id, orderData),
			).rejects.toThrow("Amount can't be less or equal to zero");
		});
	});

	describe("getAll", () => {
		it("should return all orders with populated fields", async () => {
			await OrderModel.create({
				product: testProduct._id,
				customer: testCustomer._id,
				quantity: 5,
				price: 500,
			});

			const orders = await orderService.getAll();

			expect(orders).toHaveLength(1);
			expect(orders[0].product).toBeDefined();
			expect(orders[0].customer).toBeDefined();
			expect(orders[0].product.name).toBe("Test Product");
			expect(orders[0].customer.name).toBe("Test Customer");
		});

		it("should return empty array when no orders exist", async () => {
			const orders = await orderService.getAll();

			expect(orders).toHaveLength(0);
		});
	});

	describe("getById", () => {
		it("should return order by id with populated fields", async () => {
			const created = await OrderModel.create({
				product: testProduct._id,
				customer: testCustomer._id,
				quantity: 5,
				price: 500,
			});

			const order = await orderService.getById(created._id);

			expect(order).toBeDefined();
			expect(order.product.name).toBe("Test Product");
			expect(order.customer.name).toBe("Test Customer");
		});

		it("should return null for non-existent order", async () => {
			const fakeId = "507f1f77bcf86cd799439011";
			const order = await orderService.getById(fakeId);

			expect(order).toBeNull();
		});
	});

	describe("update", () => {
		it("should update order fields", async () => {
			const order = await OrderModel.create({
				product: testProduct._id,
				customer: testCustomer._id,
				quantity: 5,
				price: 500,
				deliveryWay: "POSTAL",
			});

			const updated = await orderService.update(order._id, {
				deliveryWay: "COURIER",
				price: 600,
			});

			expect(updated.deliveryWay).toBe("COURIER");
			expect(updated.price).toBe(600);
		});
	});

	describe("remove", () => {
		it("should delete order", async () => {
			const order = await OrderModel.create({
				product: testProduct._id,
				customer: testCustomer._id,
				quantity: 5,
				price: 500,
			});

			await orderService.remove(order._id);

			const found = await OrderModel.findById(order._id);
			expect(found).toBeNull();
		});
	});
});
