const request = require("supertest");
const dbHandler = require("../setup");
const createApp = require("../app");
const bcrypt = require("bcrypt");
const UserModel = require("../../models/user.model");
const ProductModel = require("../../models/product.model");
const CustomerModel = require("../../models/customer.model");
const OrderModel = require("../../models/order.model");

// Set environment variables
process.env.JWT_ACCESS_SECRET = "test-access-secret";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
process.env.BACKEND_URL = "http://localhost:3005";
process.env.FRONTEND_URL = "http://localhost:4200";

// Mock mail service
jest.mock("../../services/mail.service", () => ({
	sendActivationMail: jest.fn().mockResolvedValue(true),
}));

let app;
let accessToken;
let testProduct;
let testCustomer;

describe("Order API Integration Tests", () => {
	beforeAll(async () => {
		await dbHandler.connect();
		app = createApp();
	});

	afterAll(async () => {
		await dbHandler.closeDatabase();
	});

	beforeEach(async () => {
		// Create and login user
		const hashedPassword = await bcrypt.hash("password123", 3);
		await UserModel.create({
			email: "order-test@example.com",
			password: hashedPassword,
			isActivated: true,
			activationLink: "order-test-link",
		});

		const loginRes = await request(app).post("/auth/login").send({
			email: "order-test@example.com",
			password: "password123",
		});

		accessToken = loginRes.body.accessToken;

		// Create test product and customer
		testProduct = await ProductModel.create({
			name: "Order Test Product",
			price: 100,
			quantity: 50,
		});

		testCustomer = await CustomerModel.create({
			name: "Order Test Customer",
			city: "Test City",
		});
	});

	afterEach(async () => {
		await dbHandler.clearDatabase();
	});

	describe("GET /orders", () => {
		it("should get all orders (public endpoint)", async () => {
			await OrderModel.create({
				product: testProduct._id,
				customer: testCustomer._id,
				quantity: 5,
				price: 500,
			});

			const res = await request(app).get("/orders");

			expect(res.status).toBe(200);
			expect(res.body).toHaveLength(1);
			expect(res.body[0].product).toBeDefined();
			expect(res.body[0].customer).toBeDefined();
		});
	});

	describe("GET /orders/:id", () => {
		it("should get order by id", async () => {
			const order = await OrderModel.create({
				product: testProduct._id,
				customer: testCustomer._id,
				quantity: 5,
				price: 500,
			});

			const res = await request(app).get(`/orders/${order._id}`);

			expect(res.status).toBe(200);
			expect(res.body.quantity).toBe(5);
		});

		it("should return 404 for non-existent order", async () => {
			const fakeId = "507f1f77bcf86cd799439011";

			const res = await request(app).get(`/orders/${fakeId}`);

			expect(res.status).toBe(404);
		});
	});

	describe("POST /orders/:customerId/:productId", () => {
		it("should create a new order", async () => {
			const res = await request(app)
				.post(`/orders/${testCustomer._id}/${testProduct._id}`)
				.send({
					quantity: 10,
					price: 1000,
					deliveryWay: "COURIER",
				});

			expect(res.status).toBe(200);
			expect(res.body.quantity).toBe(10);

			// Verify product quantity was reduced
			const updatedProduct = await ProductModel.findById(testProduct._id);
			expect(updatedProduct.quantity).toBe(40); // 50 - 10
		});

		it("should return 400 if order quantity exceeds stock", async () => {
			const res = await request(app)
				.post(`/orders/${testCustomer._id}/${testProduct._id}`)
				.send({
					quantity: 100, // More than 50 available
					price: 10000,
				});

			expect(res.status).toBe(400);
		});

		it("should return 400 for zero quantity", async () => {
			const res = await request(app)
				.post(`/orders/${testCustomer._id}/${testProduct._id}`)
				.send({
					quantity: 0,
					price: 0,
				});

			expect(res.status).toBe(400);
		});
	});

	describe("PUT /orders/:id", () => {
		it("should update order", async () => {
			const order = await OrderModel.create({
				product: testProduct._id,
				customer: testCustomer._id,
				quantity: 5,
				price: 500,
				deliveryWay: "POSTAL",
			});

			const res = await request(app)
				.put(`/orders/${order._id}`)
				.set("Authorization", `Bearer ${accessToken}`)
				.send({
					deliveryWay: "COURIER",
					price: 600,
				});

			expect(res.status).toBe(200);
			expect(res.body.deliveryWay).toBe("COURIER");
			expect(res.body.price).toBe(600);
		});
	});

	describe("DELETE /orders/:id", () => {
		it("should delete order", async () => {
			const order = await OrderModel.create({
				product: testProduct._id,
				customer: testCustomer._id,
				quantity: 5,
				price: 500,
			});

			const res = await request(app)
				.delete(`/orders/${order._id}`)
				.set("Authorization", `Bearer ${accessToken}`);

			expect(res.status).toBe(200);

			const found = await OrderModel.findById(order._id);
			expect(found).toBeNull();
		});
	});
});
