const { validationResult } = require("express-validator");
const agreementService = require("../services/agreement.service");
const ApiException = require("../exceptions/api.exception");

class AgreementController {
	/**
	 * Get all agreements
	 */
	async getAll(req, res, next) {
		try {
			const agreements = await agreementService.getAll();
			return res.json(agreements);
		} catch (e) {
			next(e);
		}
	}

	/**
	 * Get agreement by ID
	 */
	async getById(req, res, next) {
		try {
			const { id } = req.params;
			const agreement = await agreementService.getById(id);

			if (!agreement) {
				throw ApiException.NotFound("Agreement not found");
			}

			return res.json(agreement);
		} catch (e) {
			next(e);
		}
	}

	/**
	 * Create a new agreement for a customer
	 */
	async create(req, res, next) {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw ApiException.BadRequest("Validation error", errors.array());
			}

			const { customerId } = req.params;
			const agreementData = req.body;

			const agreement = await agreementService.create(
				customerId,
				agreementData,
			);
			return res.status(201).json(agreement);
		} catch (e) {
			next(e);
		}
	}

	/**
	 * Validate a client token and return agreement info
	 */
	async validateToken(req, res, next) {
		try {
			const { token } = req.params;
			const agreement = await agreementService.validateClientToken(token);

			if (!agreement) {
				throw ApiException.NotFound("Invalid or expired token");
			}

			return res.json({
				valid: true,
				agreement,
			});
		} catch (e) {
			next(e);
		}
	}

	/**
	 * Get agreement by client token
	 */
	async getByToken(req, res, next) {
		try {
			const { token } = req.params;
			const agreement = await agreementService.getByClientToken(token);

			if (!agreement) {
				throw ApiException.NotFound("Agreement not found");
			}

			return res.json(agreement);
		} catch (e) {
			next(e);
		}
	}

	/**
	 * Get active agreement by customer ID
	 */
	async getByCustomer(req, res, next) {
		try {
			const { customerId } = req.params;
			const agreement = await agreementService.getActiveAgreementByCustomer(
				customerId,
			);

			if (!agreement) {
				throw ApiException.NotFound(
					"No active agreement found for this customer",
				);
			}

			return res.json(agreement);
		} catch (e) {
			next(e);
		}
	}

	/**
	 * Update agreement
	 */
	async update(req, res, next) {
		try {
			const { id } = req.params;
			const updateData = req.body;

			const agreement = await agreementService.update(id, updateData);

			if (!agreement) {
				throw ApiException.NotFound("Agreement not found");
			}

			return res.json(agreement);
		} catch (e) {
			next(e);
		}
	}

	/**
	 * Deactivate agreement
	 */
	async deactivate(req, res, next) {
		try {
			const { id } = req.params;
			const agreement = await agreementService.deactivate(id);

			if (!agreement) {
				throw ApiException.NotFound("Agreement not found");
			}

			return res.json(agreement);
		} catch (e) {
			next(e);
		}
	}

	/**
	 * Remove agreement
	 */
	async remove(req, res, next) {
		try {
			const { id } = req.params;
			const agreement = await agreementService.remove(id);

			if (!agreement) {
				throw ApiException.NotFound("Agreement not found");
			}

			return res.json(agreement);
		} catch (e) {
			next(e);
		}
	}

	/**
	 * Renew agreement
	 */
	async renew(req, res, next) {
		try {
			const { id } = req.params;
			const { ends_at } = req.body;

			const agreement = await agreementService.renew(id, ends_at);

			if (!agreement) {
				throw ApiException.NotFound("Agreement not found");
			}

			return res.json(agreement);
		} catch (e) {
			next(e);
		}
	}
}

module.exports = new AgreementController();
