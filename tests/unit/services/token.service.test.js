const jwt = require("jsonwebtoken");

// Set environment variables before requiring the service
process.env.JWT_ACCESS_SECRET = "test-access-secret";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret";

const tokenService = require("../../../services/token.service");

describe("TokenService", () => {
	const testUserId = "507f1f77bcf86cd799439011";

	describe("generateTokens", () => {
		it("should generate both access and refresh tokens", () => {
			const tokens = tokenService.generateTokens(testUserId);

			expect(tokens).toHaveProperty("accessToken");
			expect(tokens).toHaveProperty("refreshToken");
			expect(typeof tokens.accessToken).toBe("string");
			expect(typeof tokens.refreshToken).toBe("string");
		});

		it("should generate tokens containing the user id", () => {
			const tokens = tokenService.generateTokens(testUserId);

			const accessDecoded = jwt.decode(tokens.accessToken);
			const refreshDecoded = jwt.decode(tokens.refreshToken);

			expect(accessDecoded.id).toBe(testUserId);
			expect(refreshDecoded.id).toBe(testUserId);
		});

		it("should generate access token with 1h expiry", () => {
			const tokens = tokenService.generateTokens(testUserId);
			const decoded = jwt.decode(tokens.accessToken);

			// exp - iat should be approximately 1 hour (3600 seconds)
			expect(decoded.exp - decoded.iat).toBe(3600);
		});

		it("should generate refresh token with 30d expiry", () => {
			const tokens = tokenService.generateTokens(testUserId);
			const decoded = jwt.decode(tokens.refreshToken);

			// exp - iat should be approximately 30 days (2592000 seconds)
			expect(decoded.exp - decoded.iat).toBe(30 * 24 * 60 * 60);
		});
	});

	describe("validateAccessToken", () => {
		it("should return token data for valid access token", () => {
			const tokens = tokenService.generateTokens(testUserId);
			const result = tokenService.validateAccessToken(tokens.accessToken);

			expect(result).toBeDefined();
			expect(result.id).toBe(testUserId);
		});

		it("should return null for invalid access token", () => {
			const result = tokenService.validateAccessToken("invalid-token");

			expect(result).toBeNull();
		});

		it("should return null for refresh token used as access token", () => {
			const tokens = tokenService.generateTokens(testUserId);
			// Refresh token is signed with different secret, should fail
			const result = tokenService.validateAccessToken(tokens.refreshToken);

			expect(result).toBeNull();
		});

		it("should return null for expired access token", () => {
			// Create an expired token manually
			const expiredToken = jwt.sign(
				{ id: testUserId },
				process.env.JWT_ACCESS_SECRET,
				{ expiresIn: "-1h" },
			);

			const result = tokenService.validateAccessToken(expiredToken);

			expect(result).toBeNull();
		});
	});

	describe("validateRefreshToken", () => {
		it("should return token data for valid refresh token", () => {
			const tokens = tokenService.generateTokens(testUserId);
			const result = tokenService.validateRefreshToken(tokens.refreshToken);

			expect(result).toBeDefined();
			expect(result.id).toBe(testUserId);
		});

		it("should return null for invalid refresh token", () => {
			const result = tokenService.validateRefreshToken("invalid-token");

			expect(result).toBeNull();
		});

		it("should return null for access token used as refresh token", () => {
			const tokens = tokenService.generateTokens(testUserId);
			// Access token is signed with different secret, should fail
			const result = tokenService.validateRefreshToken(tokens.accessToken);

			expect(result).toBeNull();
		});

		it("should return null for expired refresh token", () => {
			const expiredToken = jwt.sign(
				{ id: testUserId },
				process.env.JWT_REFRESH_SECRET,
				{ expiresIn: "-1d" },
			);

			const result = tokenService.validateRefreshToken(expiredToken);

			expect(result).toBeNull();
		});
	});
});
