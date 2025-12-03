const dbHandler = require("../../setup");
const customerService = require("../../../services/customer.service");
const CustomerModel = require("../../../models/customer.model");

describe("CustomerService", () => {
	beforeAll(async () => {
		await dbHandler.connect();
	});

	afterAll(async () => {
		await dbHandler.closeDatabase();
	});

	afterEach(async () => {
		await dbHandler.clearDatabase();
	});

	describe("create", () => {
		it("should create a new customer", async () => {
			const customerData = {
				name: "John Doe",
				street: "123 Main St",
				city: "Test City",
				state: "TS",
				zip: 12345,
				phone: "555-1234",
				contactPerson: "Jane Doe",
			};

			const customer = await customerService.create(customerData);

			expect(customer).toBeDefined();
			expect(customer.name).toBe(customerData.name);
			expect(customer.city).toBe(customerData.city);
			expect(customer.phone).toBe(customerData.phone);
		});

		it("should update existing customer if name exists", async () => {
			const customerData = {
				name: "Existing Customer",
				city: "Old City",
			};

			await CustomerModel.create(customerData);

			const updatedData = {
				name: "Existing Customer",
				city: "New City",
			};

			const result = await customerService.create(updatedData);

			expect(result.city).toBe("New City");

			// Should still only have one customer
			const allCustomers = await CustomerModel.find({
				name: "Existing Customer",
			});
			expect(allCustomers).toHaveLength(1);
		});
	});

	describe("getAll", () => {
		it("should return all customers", async () => {
			await CustomerModel.create([
				{ name: "Customer 1", city: "City 1" },
				{ name: "Customer 2", city: "City 2" },
				{ name: "Customer 3", city: "City 3" },
			]);

			const customers = await customerService.getAll();

			expect(customers).toHaveLength(3);
		});

		it("should return empty array when no customers exist", async () => {
			const customers = await customerService.getAll();

			expect(customers).toHaveLength(0);
		});
	});

	describe("getById", () => {
		it("should return customer by id", async () => {
			const created = await CustomerModel.create({
				name: "Get By Id Test",
				city: "Test City",
			});

			const customer = await customerService.getById(created._id);

			expect(customer).toBeDefined();
			expect(customer.name).toBe("Get By Id Test");
		});

		it("should return null for non-existent id", async () => {
			const fakeId = "507f1f77bcf86cd799439011";
			const customer = await customerService.getById(fakeId);

			expect(customer).toBeNull();
		});
	});

	describe("update", () => {
		it("should update customer fields", async () => {
			const customer = await CustomerModel.create({
				name: "Original Name",
				city: "Original City",
				phone: "111-1111",
			});

			const updated = await customerService.update(customer._id, {
				city: "Updated City",
				phone: "222-2222",
			});

			expect(updated.city).toBe("Updated City");
			expect(updated.phone).toBe("222-2222");
			expect(updated.name).toBe("Original Name"); // Unchanged
		});

		it("should return null for non-existent customer", async () => {
			const fakeId = "507f1f77bcf86cd799439011";
			const updated = await customerService.update(fakeId, {
				city: "New City",
			});

			expect(updated).toBeNull();
		});
	});

	describe("remove", () => {
		it("should delete customer", async () => {
			const customer = await CustomerModel.create({
				name: "To Delete",
				city: "Delete City",
			});

			await customerService.remove(customer._id);

			const found = await CustomerModel.findById(customer._id);
			expect(found).toBeNull();
		});
	});
});
