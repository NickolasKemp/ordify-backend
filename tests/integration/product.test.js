const request = require("supertest");
const dbHandler = require("../setup");
const createApp = require("../app");
const bcrypt = require("bcrypt");
const UserModel = require("../../models/user.model");
const ProductModel = require("../../models/product.model");

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

describe("Product API Integration Tests", () => {
	beforeAll(async () => {
		await dbHandler.connect();
		app = createApp();
	});

	afterAll(async () => {
		await dbHandler.closeDatabase();
	});

	beforeEach(async () => {
		// Create and login user to get access token
		const hashedPassword = await bcrypt.hash("password123", 3);
		await UserModel.create({
			email: "product-test@example.com",
			password: hashedPassword,
			isActivated: true,
			activationLink: "product-test-link",
		});

		const loginRes = await request(app).post("/auth/login").send({
			email: "product-test@example.com",
			password: "password123",
		});

		accessToken = loginRes.body.accessToken;
	});

	afterEach(async () => {
		await dbHandler.clearDatabase();
	});

	describe("GET /products", () => {
		beforeEach(async () => {
			await ProductModel.create([
				{ name: "Product 1", price: 100, quantity: 10 },
				{ name: "Product 2", price: 200, quantity: 20 },
				{ name: "Special Item", price: 300, quantity: 30 },
			]);
		});

		it("should get all products (public endpoint)", async () => {
			const res = await request(app).get("/products");

			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("products");
			expect(res.body.products).toHaveLength(3);
		});

		it("should filter products by search term", async () => {
			const res = await request(app).get("/products?searchTerm=Special");

			expect(res.status).toBe(200);
			expect(res.body.products).toHaveLength(1);
			expect(res.body.products[0].name).toBe("Special Item");
		});

		it("should support pagination", async () => {
			const res = await request(app).get("/products?page=0&pageSize=2");

			expect(res.status).toBe(200);
			expect(res.body.products).toHaveLength(2);
			expect(res.body.totalPages).toBe(2);
		});
	});

	describe("GET /products/:id", () => {
		it("should get product by id (public endpoint)", async () => {
			const product = await ProductModel.create({
				name: "Single Product",
				price: 150,
				quantity: 15,
			});

			const res = await request(app).get(`/products/${product._id}`);

			expect(res.status).toBe(200);
			expect(res.body.name).toBe("Single Product");
		});

		it("should return 404 for non-existent product", async () => {
			const fakeId = "507f1f77bcf86cd799439011";

			const res = await request(app).get(`/products/${fakeId}`);

			expect(res.status).toBe(404);
		});
	});

	describe("POST /products", () => {
		it("should create a new product", async () => {
			const res = await request(app)
				.post("/products")
				.set("Authorization", `Bearer ${accessToken}`)
				.send({
					name: "New Product",
					price: 250,
					quantity: 25,
					description: "Test description",
					deliveryPrice: 10,
					deliveryPeriod: "1-2 days",
				});

			expect(res.status).toBe(200);
			expect(res.body.name).toBe("New Product");
			expect(res.body.price).toBe(250);
		});

		it("should return 400 for duplicate product name", async () => {
			await ProductModel.create({
				name: "Existing Product",
				price: 100,
			});

			const res = await request(app)
				.post("/products")
				.set("Authorization", `Bearer ${accessToken}`)
				.send({
					name: "Existing Product",
					price: 200,
					quantity: 10,
					deliveryPrice: 5,
					deliveryPeriod: "3-5 days",
				});

			expect(res.status).toBe(400);
		});

		it("should return 400 without required fields", async () => {
			const res = await request(app)
				.post("/products")
				.set("Authorization", `Bearer ${accessToken}`)
				.send({
					name: "No Price Product",
				});

			expect(res.status).toBe(400);
		});
	});

	describe("PUT /products/:id", () => {
		it("should update product", async () => {
			const product = await ProductModel.create({
				name: "Update Test",
				price: 100,
				quantity: 10,
			});

			const res = await request(app)
				.put(`/products/${product._id}`)
				.set("Authorization", `Bearer ${accessToken}`)
				.send({
					name: "Updated Name",
					price: 150,
				});

			expect(res.status).toBe(200);
			expect(res.body.name).toBe("Updated Name");
			expect(res.body.price).toBe(150);
		});

		it("should return 404 for non-existent product", async () => {
			const fakeId = "507f1f77bcf86cd799439011";

			const res = await request(app)
				.put(`/products/${fakeId}`)
				.set("Authorization", `Bearer ${accessToken}`)
				.send({
					name: "New Name",
				});

			expect(res.status).toBe(404);
		});
	});

	describe("DELETE /products/:id", () => {
		it("should delete product", async () => {
			const product = await ProductModel.create({
				name: "Delete Test",
				price: 100,
			});

			const res = await request(app)
				.delete(`/products/${product._id}`)
				.set("Authorization", `Bearer ${accessToken}`);

			expect(res.status).toBe(200);

			// Verify deletion
			const found = await ProductModel.findById(product._id);
			expect(found).toBeNull();
		});
	});

	describe("Delivery Options", () => {
		it("should add delivery option to product", async () => {
			const product = await ProductModel.create({
				name: "Delivery Test",
				price: 100,
				deliveryOptions: [],
			});

			const res = await request(app)
				.patch(`/products/${product._id}/delivery-options`)
				.set("Authorization", `Bearer ${accessToken}`)
				.send({
					type: "COURIER",
					price: 10,
					period: "1-2 days",
				});

			expect(res.status).toBe(200);
			expect(res.body.deliveryOptions).toHaveLength(1);
		});

		it("should delete delivery option from product", async () => {
			const product = await ProductModel.create({
				name: "Delete Delivery Test",
				price: 100,
				deliveryOptions: [{ type: "COURIER", price: 10, period: "1-2 days" }],
			});

			const res = await request(app)
				.patch(`/products/${product._id}/delivery-options/COURIER`)
				.set("Authorization", `Bearer ${accessToken}`);

			expect(res.status).toBe(200);
			expect(res.body.deliveryOptions).toHaveLength(0);
		});
	});
});
