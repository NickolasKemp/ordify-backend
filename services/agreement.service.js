const crypto = require("crypto");
const AgreementModel = require("../models/agreement.model");
const CustomerModel = require("../models/customer.model");
const LegalEntityModel = require("../models/legal_entity.model");
const ApiException = require("../exceptions/api.exception");

class AgreementService {
	/**
	 * Generate a unique client token for agreement identification
	 */
	generateClientToken() {
		return crypto.randomBytes(32).toString("hex");
	}

	/**
	 * Create a new agreement for a customer (first order scenario)
	 * @param {string} customerId - The customer ID
	 * @param {Object} agreementData - Agreement details (ends_at, legalEntity)
	 * @returns {Object} Created agreement with client token
	 */
	async create(customerId, agreementData = {}) {
		const customer = await CustomerModel.findById(customerId);
		if (!customer) {
			throw ApiException.NotFound("Customer not found");
		}

		// Check if customer already has an active agreement
		const existingAgreement = await this.getActiveAgreementByCustomer(
			customerId,
		);
		if (existingAgreement) {
			throw ApiException.BadRequest("Customer already has an active agreement");
		}

		// Generate unique client token
		const clientToken = this.generateClientToken();

		// Set default ends_at to 1 year from now if not provided
		const ends_at = agreementData.ends_at
			? new Date(agreementData.ends_at)
			: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

		// Create legal entity if provided
		let legalEntityId = null;
		if (agreementData.legalEntity) {
			const legalEntity = await LegalEntityModel.create(
				agreementData.legalEntity,
			);
			legalEntityId = legalEntity._id;
		}

		const agreement = await AgreementModel.create({
			customer: customerId,
			legalEntity: legalEntityId,
			ends_at,
			clientToken,
			isActive: true,
		});

		return agreement
			.populate("customer")
			.then(doc => doc.populate("legalEntity"));
	}

	/**
	 * Get all agreements
	 */
	async getAll() {
		return await AgreementModel.find()
			.populate("customer")
			.populate("legalEntity");
	}

	/**
	 * Get agreement by ID
	 */
	async getById(id) {
		return await AgreementModel.findById(id)
			.populate("customer")
			.populate("legalEntity");
	}

	/**
	 * Get active agreement by customer ID
	 */
	async getActiveAgreementByCustomer(customerId) {
		return await AgreementModel.findOne({
			customer: customerId,
			isActive: true,
			ends_at: { $gte: new Date() },
		})
			.populate("customer")
			.populate("legalEntity");
	}

	/**
	 * Validate client token and return agreement if valid
	 * @param {string} clientToken - The client token to validate
	 * @returns {Object|null} Agreement if valid, null otherwise
	 */
	async validateClientToken(clientToken) {
		if (!clientToken) {
			return null;
		}

		const agreement = await AgreementModel.findOne({
			clientToken,
			isActive: true,
			ends_at: { $gte: new Date() },
		})
			.populate("customer")
			.populate("legalEntity");

		return agreement;
	}

	/**
	 * Get agreement by client token
	 */
	async getByClientToken(clientToken) {
		return await AgreementModel.findOne({ clientToken })
			.populate("customer")
			.populate("legalEntity");
	}

	/**
	 * Update agreement
	 */
	async update(agreementId, updateData) {
		return await AgreementModel.findByIdAndUpdate(agreementId, updateData, {
			new: true,
		})
			.populate("customer")
			.populate("legalEntity");
	}

	/**
	 * Deactivate agreement
	 */
	async deactivate(agreementId) {
		return await AgreementModel.findByIdAndUpdate(
			agreementId,
			{ isActive: false },
			{ new: true },
		);
	}

	/**
	 * Remove agreement
	 */
	async remove(agreementId) {
		return await AgreementModel.findByIdAndDelete(agreementId);
	}

	/**
	 * Renew agreement with new end date
	 */
	async renew(agreementId, newEndDate) {
		const ends_at = newEndDate
			? new Date(newEndDate)
			: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

		return await AgreementModel.findByIdAndUpdate(
			agreementId,
			{ ends_at, isActive: true },
			{ new: true },
		)
			.populate("customer")
			.populate("legalEntity");
	}
}

module.exports = new AgreementService();
