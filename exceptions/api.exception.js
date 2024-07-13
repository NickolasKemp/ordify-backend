module.exports = class ApiException extends Error {
	status;
	errors;

	constructor(status, message, errors = []) {
		super(message);
		this.status = status;
		this.errors = errors;
	}

	static NotFound() {
		return new ApiException(404, "Not found");
	}

	static Unauthorized() {
		return new ApiException(401, "Unauthorized");
	}

	static BadRequest(message, errors = []) {
		return new ApiException(400, message, errors);
	}
};
