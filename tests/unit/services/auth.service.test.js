const dbHandler = require("../../setup");
const bcrypt = require("bcrypt");

// Set environment variables
process.env.JWT_ACCESS_SECRET = "test-access-secret";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
process.env.BACKEND_URL = "http://localhost:3005";

// Mock mail service to avoid sending emails
jest.mock("../../../services/mail.service", () => ({
	sendActivationMail: jest.fn().mockResolvedValue(true),
}));

const authService = require("../../../services/auth.service");
const tokenService = require("../../../services/token.service");
const UserModel = require("../../../models/user.model");
const TokenModel = require("../../../models/token.model");

describe("AuthService", () => {
	beforeAll(async () => {
		await dbHandler.connect();
	});

	afterAll(async () => {
		await dbHandler.closeDatabase();
	});

	afterEach(async () => {
		await dbHandler.clearDatabase();
	});

	describe("register", () => {
		it("should create a new user with hashed password", async () => {
			const email = "test@example.com";
			const password = "password123";

			const user = await authService.register(email, password);

			expect(user).toBeDefined();
			expect(user.email).toBe(email);
			expect(user.password).not.toBe(password);
			expect(user.isActivated).toBe(false);
			expect(user.activationLink).toBeDefined();
		});

		it("should throw error if user already exists", async () => {
			const email = "test@example.com";
			const password = "password123";

			await authService.register(email, password);

			await expect(authService.register(email, password)).rejects.toThrow(
				"Already exists",
			);
		});
	});

	describe("login", () => {
		const email = "test@example.com";
		const password = "password123";

		beforeEach(async () => {
			// Create and activate user
			const hashedPassword = await bcrypt.hash(password, 3);
			await UserModel.create({
				email,
				password: hashedPassword,
				isActivated: true,
				activationLink: "test-link",
			});
		});

		it("should return tokens and user for valid credentials", async () => {
			const result = await authService.login(email, password);

			expect(result).toHaveProperty("accessToken");
			expect(result).toHaveProperty("refreshToken");
			expect(result).toHaveProperty("user");
			expect(result.user.email).toBe(email);
		});

		it("should throw error for non-existent email", async () => {
			await expect(
				authService.login("nonexistent@example.com", password),
			).rejects.toThrow("This email is not registered");
		});

		it("should throw error for wrong password", async () => {
			await expect(authService.login(email, "wrongpassword")).rejects.toThrow(
				"Password does not match",
			);
		});

		it("should throw error for non-activated account", async () => {
			// Create non-activated user
			const hashedPassword = await bcrypt.hash("pass123", 3);
			await UserModel.create({
				email: "inactive@example.com",
				password: hashedPassword,
				isActivated: false,
				activationLink: "inactive-link",
			});

			await expect(
				authService.login("inactive@example.com", "pass123"),
			).rejects.toThrow("This account is not activated");
		});

		it("should save refresh token to database", async () => {
			const result = await authService.login(email, password);

			const tokenInDb = await TokenModel.findOne({
				refreshToken: result.refreshToken,
			});

			expect(tokenInDb).toBeDefined();
		});
	});

	describe("refresh", () => {
		it("should return new tokens for valid refresh token", async () => {
			// Create user and login first
			const hashedPassword = await bcrypt.hash("password123", 3);
			const user = await UserModel.create({
				email: "refresh@example.com",
				password: hashedPassword,
				isActivated: true,
				activationLink: "refresh-link",
			});

			const tokens = tokenService.generateTokens(user.id);
			await tokenService.saveRefreshToken(user.id, tokens.refreshToken);

			const result = await authService.refresh(tokens.refreshToken);

			expect(result).toHaveProperty("accessToken");
			expect(result).toHaveProperty("refreshToken");
		});

		it("should throw error for invalid refresh token", async () => {
			await expect(authService.refresh("invalid-token")).rejects.toThrow(
				"Unauthorized",
			);
		});
	});

	describe("logout", () => {
		it("should remove refresh token from database", async () => {
			// Create user and save token
			const hashedPassword = await bcrypt.hash("password123", 3);
			const user = await UserModel.create({
				email: "logout@example.com",
				password: hashedPassword,
				isActivated: true,
				activationLink: "logout-link",
			});

			const tokens = tokenService.generateTokens(user.id);
			await tokenService.saveRefreshToken(user.id, tokens.refreshToken);

			await authService.logout(tokens.refreshToken);

			const tokenInDb = await TokenModel.findOne({
				refreshToken: tokens.refreshToken,
			});

			expect(tokenInDb).toBeNull();
		});

		it("should throw error for non-existent token", async () => {
			await expect(authService.logout("non-existent-token")).rejects.toThrow(
				"Unauthorized",
			);
		});
	});

	describe("activate", () => {
		it("should activate user account", async () => {
			const activationLink = "activation-test-link";
			await UserModel.create({
				email: "activate@example.com",
				password: "hashedpass",
				isActivated: false,
				activationLink,
			});

			await authService.activate(activationLink);

			const user = await UserModel.findOne({ activationLink });
			expect(user.isActivated).toBe(true);
		});
	});
});
