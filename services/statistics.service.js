const orderService = require("./order.service");
const productService = require("./product.service");
const customerService = require("./customer.service");

class StatisticsService {
	async getMain() {
		const orders = await orderService.getAll();
		const products = await productService.getAll();
		const customers = await customerService.getAll();
		let totalOrdersPrice = 0;

		orders.forEach(order => {
			totalOrdersPrice += order.price;
		});

		return [
			{
				name: "Products",
				value: products.length,
			},
			{
				name: "Customers",
				value: customers.length,
			},
			{
				name: "Orders",
				value: orders.length,
			},
			{
				name: "Total orders price",
				value: totalOrdersPrice,
				isCurrencyValue: true,
			},
		];
	}
}

module.exports = new StatisticsService();
