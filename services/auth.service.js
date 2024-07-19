const ApiException = require("../exceptions/api.exception");
const UserModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const tokenService = require("./token.service");
const uuid = require("uuid");
const mailService = require("./mail.service");

class AuthService {
	async register(email, password) {
		const same = await UserModel.findOne({ email });

		if (same) {
			throw ApiException.BadRequest("Already exists");
		}

		const hashedPassword = await bcrypt.hash(password, 3);
		const activationLink = uuid.v4();

		const user = await UserModel.create({
			password: hashedPassword,
			email,
			activationLink,
		});

		await mailService.sendActivationMail(
			`${process.env.BACKEND_URL}/auth/activate/${activationLink}`,
			email,
		);

		return user;
	}

	async activate(activationLink) {
		const user = await UserModel.findOneAndUpdate(
			{ activationLink },
			{
				isActivated: true,
			},
		);

		if (!user) {
			throw ApiError.BadRequest("User is not found by activation link");
		}

		return;
	}

	async login(email, password) {
		const user = await UserModel.findOne({ email });

		if (!user) {
			throw ApiException.BadRequest("This email is not registered");
		}

		if (!user.isActivated) {
			throw ApiException.BadRequest("This account is not activated");
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
		const tokenFromDb = await tokenService.findRefreshToken(refreshToken);

		if (!tokenData || !tokenFromDb) {
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
