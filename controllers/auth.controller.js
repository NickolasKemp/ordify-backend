const { validationResult } = require("express-validator");
const ApiException = require("../exceptions/api.exception");
const authService = require("../services/auth.service");

class AuthController {
	async register(req, res, next) {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw ApiException.BadRequest("Validation error", errors.array());
			}

			const { email, password } = req.body;
			const userData = await authService.register(email, password);
			return res.json(userData);
		} catch (e) {
			next(e);
		}
	}

	async activate(req, res, next) {
		try {
			const activationLink = req.params.link;
			await authService.activate(activationLink);
			return res.redirect(process.env.FRONTEND_URL);
		} catch (e) {
			next(e);
		}
	}

	async login(req, res, next) {
		try {
			const { email, password } = req.body;
			const userData = await authService.login(email, password);
			res.cookie("refreshToken", userData.refreshToken, {
				maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
				httpOnly: true,
				secure: true,
				sameSite: "None",
			});
			return res.json(userData);
		} catch (e) {
			next(e);
		}
	}

	async refresh(req, res, next) {
		try {
			const { refreshToken } = req.cookies;
			const userData = await authService.refresh(refreshToken);
			res.cookie("refreshToken", userData.refreshToken, {
				maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
				httpOnly: true,
				secure: true,
				sameSite: "None",
			});
			return res.json(userData);
		} catch (e) {
			next(e);
		}
	}

	async logout(req, res, next) {
		try {
			const { refreshToken } = req.cookies;
			const tokenData = await authService.logout(refreshToken);
			res.clearCookie("refreshToken");
			return res.json(tokenData);
		} catch (e) {
			next(e);
		}
	}
}

module.exports = new AuthController();
