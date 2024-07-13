const ApiException = require("../exceptions/api.exception");
const tokenService = require("../services/token.service");

module.exports = function (req, res, next) {
	try {
		const authorizationHeader = req.headers.authorization;
		if (!authorizationHeader) {
			throw ApiException.Unauthorized();
		}

		const accessToken = authorizationHeader.split(" ")[1];

		if (!accessToken) {
			throw ApiException.Unauthorized();
		}

		const tokenData = tokenService.validateAccessToken(accessToken);

		if (!tokenData) {
			throw ApiException.Unauthorized();
		}

		req.user = tokenData;
		next();
	} catch (e) {
		next(e);
	}
};
