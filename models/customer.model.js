const { Schema, model } = require("mongoose");
const Order = require("./order.model");

const CustomerSchema = new Schema({
	name: { type: String, unique: true },
	street: { type: String },
	city: { type: String },
	state: { type: String },
	zip: { type: Number },
	phone: { type: String },
	contactPerson: { type: String },
});

CustomerSchema.pre("findOneAndDelete", async function (next) {
	const customerId = this.getQuery()["_id"];
	await Order.deleteMany({ customer: customerId });
	next();
});

module.exports = model("Customer", CustomerSchema);
