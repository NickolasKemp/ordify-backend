const { Schema, model } = require("mongoose");

const CustomerSchema = new Schema({
	name: { type: String },
	street: { type: String },
	city: { type: String },
	state: { type: String },
	zip: { type: Number },
	phone: { type: String },
	contactPerson: { type: String },
});

module.exports = model("Customer", CustomerSchema);
