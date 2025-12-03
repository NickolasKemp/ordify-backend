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

describe("E2E Workflow Tests", () => {
	beforeAll(async () => {
		await dbHandler.connect();
		app = createApp();
	});

	afterAll(async () => {
		await dbHandler.closeDatabase();
	});

	afterEach(async () => {
		await dbHandler.clearDatabase();
	});

	describe("Complete Order Workflow", () => {
		it("should complete full workflow: login -> create customer -> create product -> create order", async () => {
			// Step 1: Create and login user
			const hashedPassword = await bcrypt.hash("password123", 3);
			await UserModel.create({
				email: "e2e@example.com",
				password: hashedPassword,
				isActivated: true,
				activationLink: "e2e-link",
			});

			const loginRes = await request(app).post("/auth/login").send({
				email: "e2e@example.com",
				password: "password123",
			});

			expect(loginRes.status).toBe(200);
			const { accessToken } = loginRes.body;
			expect(accessToken).toBeDefined();

			// Step 2: Create a customer
			const customerRes = await request(app)
				.post("/customers")
				.set("Authorization", `Bearer ${accessToken}`)
				.send({
					name: "E2E Test Customer",
					street: "123 E2E Street",
					city: "Test City",
					state: "TS",
					zip: 12345,
					phone: "5551234567",
					contactPerson: "E2E Tester",
				});

			expect(customerRes.status).toBe(200);
			const customerId = customerRes.body._id;
			expect(customerId).toBeDefined();

			// Step 3: Create a product
			const productRes = await request(app)
				.post("/products")
				.set("Authorization", `Bearer ${accessToken}`)
				.send({
					name: "E2E Test Product",
					description: "A product for E2E testing",
					price: 100,
					quantity: 100,
					deliveryPrice: 15,
					deliveryPeriod: "1-2 days",
				});

			expect(productRes.status).toBe(200);
			const productId = productRes.body._id;
			expect(productId).toBeDefined();
			expect(productRes.body.quantity).toBe(100);

			// Step 4: Create an order
			const orderRes = await request(app)
				.post(`/orders/${customerId}/${productId}`)
				.send({
					quantity: 5,
					price: 500,
					deliveryWay: "COURIER",
				});

			expect(orderRes.status).toBe(200);
			const orderId = orderRes.body._id;
			expect(orderId).toBeDefined();

			// Step 5: Verify product quantity was reduced
			const updatedProductRes = await request(app).get(
				`/products/${productId}`,
			);

			expect(updatedProductRes.status).toBe(200);
			expect(updatedProductRes.body.quantity).toBe(95); // 100 - 5

			// Step 6: Verify order exists with populated data
			const orderDetailRes = await request(app).get(`/orders/${orderId}`);

			expect(orderDetailRes.status).toBe(200);
			expect(orderDetailRes.body.product.name).toBe("E2E Test Product");
			expect(orderDetailRes.body.customer.name).toBe("E2E Test Customer");
			expect(orderDetailRes.body.quantity).toBe(5);
			expect(orderDetailRes.body.deliveryWay).toBe("COURIER");
		});

		it("should handle order workflow with multiple orders reducing inventory", async () => {
			// Setup: Create user, customer, product
			const hashedPassword = await bcrypt.hash("password123", 3);
			await UserModel.create({
				email: "multi-order@example.com",
				password: hashedPassword,
				isActivated: true,
				activationLink: "multi-order-link",
			});

			const loginRes = await request(app).post("/auth/login").send({
				email: "multi-order@example.com",
				password: "password123",
			});

			const { accessToken } = loginRes.body;

			const customer = await CustomerModel.create({
				name: "Multi Order Customer",
				city: "Test City",
			});

			const product = await ProductModel.create({
				name: "Limited Stock Product",
				price: 50,
				quantity: 20,
			});

			// Order 1: 8 items
			const order1Res = await request(app)
				.post(`/orders/${customer._id}/${product._id}`)
				.set("Authorization", `Bearer ${accessToken}`)
				.send({ quantity: 8, price: 400 });

			expect(order1Res.status).toBe(200);

			// Order 2: 7 items
			const order2Res = await request(app)
				.post(`/orders/${customer._id}/${product._id}`)
				.set("Authorization", `Bearer ${accessToken}`)
				.send({ quantity: 7, price: 350 });

			expect(order2Res.status).toBe(200);

			// Order 3: Should fail - only 5 items left, trying to order 10
			const order3Res = await request(app)
				.post(`/orders/${customer._id}/${product._id}`)
				.set("Authorization", `Bearer ${accessToken}`)
				.send({ quantity: 10, price: 500 });

			expect(order3Res.status).toBe(400);

			// Verify final product quantity: 20 - 8 - 7 = 5
			const finalProduct = await ProductModel.findById(product._id);
			expect(finalProduct.quantity).toBe(5);

			// Verify only 2 orders exist
			const allOrders = await OrderModel.find({ product: product._id });
			expect(allOrders).toHaveLength(2);
		});
	});

	describe("Authentication Flow E2E", () => {
		it("should complete full auth flow: register -> login -> refresh -> logout", async () => {
			// Step 1: Register (but can't login until activated)
			const registerRes = await request(app).post("/auth/register").send({
				email: "fullauth@example.com",
				password: "securepass123",
			});

			expect(registerRes.status).toBe(200);
			expect(registerRes.body.isActivated).toBe(false);

			// Manually activate for testing
			await UserModel.findByIdAndUpdate(registerRes.body._id, {
				isActivated: true,
			});

			// Step 2: Login
			const loginRes = await request(app).post("/auth/login").send({
				email: "fullauth@example.com",
				password: "securepass123",
			});

			expect(loginRes.status).toBe(200);
			expect(loginRes.body.accessToken).toBeDefined();
			const cookies = loginRes.headers["set-cookie"];

			// Step 3: Refresh tokens
			const refreshRes = await request(app)
				.get("/auth/refresh")
				.set("Cookie", cookies);

			expect(refreshRes.status).toBe(200);
			expect(refreshRes.body.accessToken).toBeDefined();
			expect(refreshRes.body.refreshToken).toBeDefined();

			// Step 4: Logout
			const newCookies = refreshRes.headers["set-cookie"];
			const logoutRes = await request(app)
				.get("/auth/logout")
				.set("Cookie", newCookies);

			expect(logoutRes.status).toBe(200);

			// Step 5: Verify can't refresh after logout
			const failedRefreshRes = await request(app)
				.get("/auth/refresh")
				.set("Cookie", newCookies);

			expect(failedRefreshRes.status).toBe(401);
		});
	});

	describe("Cascade Delete E2E", () => {
		it("should delete associated orders when product is deleted", async () => {
			// Setup
			const hashedPassword = await bcrypt.hash("password123", 3);
			await UserModel.create({
				email: "cascade@example.com",
				password: hashedPassword,
				isActivated: true,
				activationLink: "cascade-link",
			});

			const loginRes = await request(app).post("/auth/login").send({
				email: "cascade@example.com",
				password: "password123",
			});

			const { accessToken } = loginRes.body;

			const customer = await CustomerModel.create({
				name: "Cascade Customer",
				city: "Test City",
			});

			const product = await ProductModel.create({
				name: "To Be Deleted Product",
				price: 100,
				quantity: 50,
			});

			// Create orders for this product
			await OrderModel.create([
				{
					product: product._id,
					customer: customer._id,
					quantity: 5,
					price: 500,
				},
				{
					product: product._id,
					customer: customer._id,
					quantity: 3,
					price: 300,
				},
			]);

			// Verify orders exist
			let orders = await OrderModel.find({ product: product._id });
			expect(orders).toHaveLength(2);

			// Delete product
			const deleteRes = await request(app)
				.delete(`/products/${product._id}`)
				.set("Authorization", `Bearer ${accessToken}`);

			expect(deleteRes.status).toBe(200);

			// Verify orders were cascade deleted
			orders = await OrderModel.find({ product: product._id });
			expect(orders).toHaveLength(0);
		});

		it("should delete associated orders when customer is deleted", async () => {
			// Setup
			const hashedPassword = await bcrypt.hash("password123", 3);
			await UserModel.create({
				email: "cascade-customer@example.com",
				password: hashedPassword,
				isActivated: true,
				activationLink: "cascade-customer-link",
			});

			const loginRes = await request(app).post("/auth/login").send({
				email: "cascade-customer@example.com",
				password: "password123",
			});

			const { accessToken } = loginRes.body;

			const customer = await CustomerModel.create({
				name: "Customer To Delete",
				city: "Test City",
			});

			const product = await ProductModel.create({
				name: "Stays Product",
				price: 100,
				quantity: 50,
			});

			// Create orders for this customer
			await OrderModel.create([
				{
					product: product._id,
					customer: customer._id,
					quantity: 5,
					price: 500,
				},
				{
					product: product._id,
					customer: customer._id,
					quantity: 3,
					price: 300,
				},
			]);

			// Verify orders exist
			let orders = await OrderModel.find({ customer: customer._id });
			expect(orders).toHaveLength(2);

			// Delete customer
			const deleteRes = await request(app)
				.delete(`/customers/${customer._id}`)
				.set("Authorization", `Bearer ${accessToken}`);

			expect(deleteRes.status).toBe(200);

			// Verify orders were cascade deleted
			orders = await OrderModel.find({ customer: customer._id });
			expect(orders).toHaveLength(0);

			// Verify product still exists
			const existingProduct = await ProductModel.findById(product._id);
			expect(existingProduct).not.toBeNull();
		});
	});
});
