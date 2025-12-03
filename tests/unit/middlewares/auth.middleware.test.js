// Set environment variables
process.env.JWT_ACCESS_SECRET = "test-access-secret";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret";

const authMiddleware = require("../../../middlewares/auth.middleware");
const tokenService = require("../../../services/token.service");

describe("AuthMiddleware", () => {
	let mockReq;
	let mockRes;
	let mockNext;

	beforeEach(() => {
		mockReq = {
			headers: {},
		};
		mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};
		mockNext = jest.fn();
	});

	it("should call next() for valid access token", () => {
		const tokens = tokenService.generateTokens("test-user-id");
		mockReq.headers.authorization = `Bearer ${tokens.accessToken}`;

		authMiddleware(mockReq, mockRes, mockNext);

		expect(mockNext).toHaveBeenCalled();
		expect(mockReq.user).toBeDefined();
		expect(mockReq.user.id).toBe("test-user-id");
	});

	it("should call next with error when no authorization header", () => {
		authMiddleware(mockReq, mockRes, mockNext);

		expect(mockNext).toHaveBeenCalled();
		const error = mockNext.mock.calls[0][0];
		expect(error).toBeDefined();
		expect(error.status).toBe(401);
	});

	it("should call next with error when no token after Bearer", () => {
		mockReq.headers.authorization = "Bearer ";

		authMiddleware(mockReq, mockRes, mockNext);

		expect(mockNext).toHaveBeenCalled();
		const error = mockNext.mock.calls[0][0];
		expect(error).toBeDefined();
		expect(error.status).toBe(401);
	});

	it("should call next with error for invalid token", () => {
		mockReq.headers.authorization = "Bearer invalid-token";

		authMiddleware(mockReq, mockRes, mockNext);

		expect(mockNext).toHaveBeenCalled();
		const error = mockNext.mock.calls[0][0];
		expect(error).toBeDefined();
		expect(error.status).toBe(401);
	});

	it("should call next with error for refresh token (wrong token type)", () => {
		const tokens = tokenService.generateTokens("test-user-id");
		mockReq.headers.authorization = `Bearer ${tokens.refreshToken}`;

		authMiddleware(mockReq, mockRes, mockNext);

		expect(mockNext).toHaveBeenCalled();
		const error = mockNext.mock.calls[0][0];
		expect(error).toBeDefined();
		expect(error.status).toBe(401);
	});

	it("should call next with error when authorization header format is wrong", () => {
		mockReq.headers.authorization = "InvalidFormat token123";

		authMiddleware(mockReq, mockRes, mockNext);

		// Even with wrong format, split(' ')[1] will extract "token123"
		// which is invalid, so should fail
		expect(mockNext).toHaveBeenCalled();
		const error = mockNext.mock.calls[0][0];
		expect(error).toBeDefined();
		expect(error.status).toBe(401);
	});
});
