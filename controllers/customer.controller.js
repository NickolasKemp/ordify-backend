const { validationResult } = require("express-validator");
const ApiException = require("../exceptions/api.exception");
const customerService = require("../services/customer.service");

class CustomerController {
	async getAll(req, res, next) {
		try {
			const customers = await customerService.getAll();
			return res.json(customers);
		} catch (e) {
			next(e);
		}
	}

	async getById(req, res, next) {
		try {
			const { id } = req.params;
			const customer = await customerService.getById(id);

			if (!customer) {
				throw ApiException.NotFound();
			}

			res.json(customer);
		} catch (e) {
			next(e);
		}
	}

	async create(req, res, next) {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw ApiException.BadRequest("Validation error", errors.array());
			}

			const customer = req.body;
			const createdCustomer = await customerService.create(customer);
			return res.json(createdCustomer);
		} catch (e) {
			next(e);
		}
	}

	async update(req, res, next) {
		try {
			const updatedCustomerFields = req.body;
			const customerId = req.params.id;
			const updatedCustomer = await customerService.update(
				customerId,
				updatedCustomerFields,
			);

			if (!updatedCustomer) {
				throw ApiException.NotFound();
			}

			return res.json(updatedCustomer);
		} catch (e) {
			next(e);
		}
	}

	async remove(req, res, next) {
		try {
			const customerId = req.params.id;
			const removedCustomer = await customerService.remove(customerId);

			if (!removedCustomer) {
				throw ApiException.NotFound();
			}

			return res.json(removedCustomer);
		} catch (e) {
			next(e);
		}
	}
}

module.exports = new CustomerController();
