const customerModel = require("../models/customer.model");

class CustomerService {
	async getAll() {
		return await customerModel.find();
	}

	async getById(id) {
		const customer = await customerModel.findById(id);
		return customer;
	}

	async create(customer) {
		return await customerModel.create(customer);
	}

	async update(customerId, updatedCustomerFields) {
		return await customerModel.findByIdAndUpdate(
			customerId,
			updatedCustomerFields,
			{ new: true },
		);
	}

	async remove(customerId) {
		return await customerModel.findByIdAndDelete(customerId);
	}
}

module.exports = new CustomerService();
