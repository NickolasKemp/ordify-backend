const ApiException = require("../exceptions/api.exception");
const UserModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const tokenService = require("./token.service");

class AuthService {
	async register(email, password) {
		const same = await UserModel.findOne({ email });

		if (same) {
			throw ApiException.BadRequest("Already exists");
		}

		const hashedPassword = await bcrypt.hash(password, 3);
		const user = await UserModel.create({
			password: hashedPassword,
			email,
		});

		const tokens = tokenService.generateTokens(user.id);
		await tokenService.saveRefreshToken(user.id, tokens.refreshToken);

		return { ...tokens, user };
	}

	async login(email, password) {
		const user = await UserModel.findOne({ email });

		if (!user) {
			throw ApiException.BadRequest("This email is not registered");
		}

		const isValidPass = await bcrypt.compare(password, user.password);

		if (!isValidPass) {
			throw ApiException.BadRequest("Password does not match");
		}

		const tokens = tokenService.generateTokens(user.id);
		await tokenService.saveRefreshToken(user.id, tokens.refreshToken);

		return { ...tokens, user };
	}

	async refresh(refreshToken) {
		const tokenData = tokenService.validateRefreshToken(refreshToken);
		// const tokenFromDb = await tokenService.findRefreshToken(refreshToken);

		if (!tokenData) {
			throw ApiException.Unauthorized();
		}

		const tokens = tokenService.generateTokens(tokenData.id);
		await tokenService.saveRefreshToken(tokenData.id, tokens.refreshToken);

		return tokens;
	}

	async logout(refreshToken) {
		const tokenData = await tokenService.removeRefreshToken(refreshToken);

		if (!tokenData) {
			throw ApiException.Unauthorized();
		}

		return tokenData;
	}
}

module.exports = new AuthService();
