const request = require("supertest");
const dbHandler = require("../setup");
const createApp = require("../app");
const bcrypt = require("bcrypt");
const UserModel = require("../../models/user.model");
const CustomerModel = require("../../models/customer.model");

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

describe("Customer API Integration Tests", () => {
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
			email: "customer-test@example.com",
			password: hashedPassword,
			isActivated: true,
			activationLink: "customer-test-link",
		});

		const loginRes = await request(app).post("/auth/login").send({
			email: "customer-test@example.com",
			password: "password123",
		});

		accessToken = loginRes.body.accessToken;
	});

	afterEach(async () => {
		await dbHandler.clearDatabase();
	});

	describe("GET /customers", () => {
		beforeEach(async () => {
			await CustomerModel.create([
				{ name: "Customer 1", city: "City 1" },
				{ name: "Customer 2", city: "City 2" },
			]);
		});

		it("should get all customers (public endpoint)", async () => {
			const res = await request(app).get("/customers");

			expect(res.status).toBe(200);
			expect(res.body).toHaveLength(2);
		});
	});

	describe("GET /customers/:id", () => {
		it("should get customer by id", async () => {
			const customer = await CustomerModel.create({
				name: "Single Customer",
				city: "Test City",
			});

			const res = await request(app).get(`/customers/${customer._id}`);

			expect(res.status).toBe(200);
			expect(res.body.name).toBe("Single Customer");
		});

		it("should return 404 for non-existent customer", async () => {
			const fakeId = "507f1f77bcf86cd799439011";

			const res = await request(app).get(`/customers/${fakeId}`);

			expect(res.status).toBe(404);
		});
	});

	describe("POST /customers", () => {
		it("should create a new customer", async () => {
			const res = await request(app)
				.post("/customers")
				.set("Authorization", `Bearer ${accessToken}`)
				.send({
					name: "New Customer",
					street: "123 Main St",
					city: "New City",
					state: "NC",
					zip: 12345,
					phone: "1234567890", // Simple format for isMobilePhone
					contactPerson: "John Doe",
				});

			expect(res.status).toBe(200);
			expect(res.body.name).toBe("New Customer");
			expect(res.body.city).toBe("New City");
		});

		it("should update existing customer if name exists", async () => {
			await CustomerModel.create({
				name: "Existing Customer",
				city: "Old City",
			});

			const res = await request(app)
				.post("/customers")
				.set("Authorization", `Bearer ${accessToken}`)
				.send({
					name: "Existing Customer",
					street: "456 New St",
					city: "Updated City",
					state: "UC",
					zip: 54321,
					phone: "9876543210",
					contactPerson: "Jane Doe",
				});

			expect(res.status).toBe(200);
			expect(res.body.city).toBe("Updated City");

			// Should still only have one customer with that name
			const customers = await CustomerModel.find({ name: "Existing Customer" });
			expect(customers).toHaveLength(1);
		});
	});

	describe("PUT /customers/:id", () => {
		it("should update customer", async () => {
			const customer = await CustomerModel.create({
				name: "Update Test",
				city: "Original City",
			});

			const res = await request(app)
				.put(`/customers/${customer._id}`)
				.set("Authorization", `Bearer ${accessToken}`)
				.send({
					city: "Updated City",
					phone: "999-9999",
				});

			expect(res.status).toBe(200);
			expect(res.body.city).toBe("Updated City");
			expect(res.body.phone).toBe("999-9999");
		});

		it("should return 404 for non-existent customer", async () => {
			const fakeId = "507f1f77bcf86cd799439011";

			const res = await request(app)
				.put(`/customers/${fakeId}`)
				.set("Authorization", `Bearer ${accessToken}`)
				.send({
					city: "New City",
				});

			expect(res.status).toBe(404);
		});
	});

	describe("DELETE /customers/:id", () => {
		it("should delete customer", async () => {
			const customer = await CustomerModel.create({
				name: "Delete Test",
				city: "Delete City",
			});

			const res = await request(app)
				.delete(`/customers/${customer._id}`)
				.set("Authorization", `Bearer ${accessToken}`);

			expect(res.status).toBe(200);

			const found = await CustomerModel.findById(customer._id);
			expect(found).toBeNull();
		});
	});
});
