const jwt = require("jsonwebtoken");
const TokenModel = require("../models/token.model");

class TokenService {
	generateTokens(id) {
		const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
			expiresIn: "30d",
		});
		const accessToken = jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, {
			expiresIn: "15s",
		});

		return { refreshToken, accessToken };
	}

	async saveRefreshToken(userId, refreshToken) {
		const tokenData = await TokenModel.findOne({ user: userId });

		if (tokenData) {
			return await TokenModel.findOneAndUpdate(
				{ user: userId },
				{ refreshToken },
			);
		}

		return await TokenModel.create({
			refreshToken,
			user: userId,
		});
	}

	validateRefreshToken(token) {
		try {
			const tokenData = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
			return tokenData;
		} catch (e) {
			return null;
		}
	}

	validateAccessToken(token) {
		try {
			const tokenData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
			return tokenData;
		} catch (e) {
			return null;
		}
	}

	async removeRefreshToken(token) {
		return await TokenModel.findOneAndDelete({ refreshToken: token });
	}

	async findRefreshToken(token) {
		return TokenModel.findOne({ refreshToken: token });
	}
}

module.exports = new TokenService();
