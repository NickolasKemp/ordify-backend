const request = require("supertest");
const dbHandler = require("../setup");
const createApp = require("../app");
const bcrypt = require("bcrypt");
const UserModel = require("../../models/user.model");

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

describe("Auth API Integration Tests", () => {
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

	describe("POST /auth/register", () => {
		it("should register a new user", async () => {
			const res = await request(app).post("/auth/register").send({
				email: "test@example.com",
				password: "password123",
			});

			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("email", "test@example.com");
			expect(res.body).toHaveProperty("isActivated", false);
		});

		it("should return 400 for duplicate email", async () => {
			await request(app).post("/auth/register").send({
				email: "duplicate@example.com",
				password: "password123",
			});

			const res = await request(app).post("/auth/register").send({
				email: "duplicate@example.com",
				password: "password456",
			});

			expect(res.status).toBe(400);
		});

		it("should return 400 for invalid email format", async () => {
			const res = await request(app).post("/auth/register").send({
				email: "invalid-email",
				password: "password123",
			});

			expect(res.status).toBe(400);
		});
	});

	describe("POST /auth/login", () => {
		beforeEach(async () => {
			// Create activated user
			const hashedPassword = await bcrypt.hash("password123", 3);
			await UserModel.create({
				email: "login@example.com",
				password: hashedPassword,
				isActivated: true,
				activationLink: "login-link",
			});
		});

		it("should login with valid credentials", async () => {
			const res = await request(app).post("/auth/login").send({
				email: "login@example.com",
				password: "password123",
			});

			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("accessToken");
			expect(res.body).toHaveProperty("refreshToken");
			expect(res.body).toHaveProperty("user");
			expect(res.headers["set-cookie"]).toBeDefined();
		});

		it("should return 400 for wrong password", async () => {
			const res = await request(app).post("/auth/login").send({
				email: "login@example.com",
				password: "wrongpassword",
			});

			expect(res.status).toBe(400);
		});

		it("should return 400 for non-existent user", async () => {
			const res = await request(app).post("/auth/login").send({
				email: "nonexistent@example.com",
				password: "password123",
			});

			expect(res.status).toBe(400);
		});
	});

	describe("GET /auth/logout", () => {
		it("should logout and clear cookie", async () => {
			// First login to get token
			const hashedPassword = await bcrypt.hash("password123", 3);
			await UserModel.create({
				email: "logout@example.com",
				password: hashedPassword,
				isActivated: true,
				activationLink: "logout-link",
			});

			const loginRes = await request(app).post("/auth/login").send({
				email: "logout@example.com",
				password: "password123",
			});

			const cookies = loginRes.headers["set-cookie"];

			const res = await request(app).get("/auth/logout").set("Cookie", cookies);

			expect(res.status).toBe(200);
		});
	});

	describe("GET /auth/refresh", () => {
		it("should refresh tokens with valid refresh token", async () => {
			// First login to get tokens
			const hashedPassword = await bcrypt.hash("password123", 3);
			await UserModel.create({
				email: "refresh@example.com",
				password: hashedPassword,
				isActivated: true,
				activationLink: "refresh-link",
			});

			const loginRes = await request(app).post("/auth/login").send({
				email: "refresh@example.com",
				password: "password123",
			});

			const cookies = loginRes.headers["set-cookie"];

			const res = await request(app)
				.get("/auth/refresh")
				.set("Cookie", cookies);

			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("accessToken");
			expect(res.body).toHaveProperty("refreshToken");
		});

		it("should return 401 without refresh token", async () => {
			const res = await request(app).get("/auth/refresh");

			expect(res.status).toBe(401);
		});
	});
});
