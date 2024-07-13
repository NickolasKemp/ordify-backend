const { Schema, model } = require("mongoose");

const ProductSchema = new Schema({
	created_at: { type: Date, required: true, default: Date.now },
	name: { type: String, unique: true, required: true },
	description: { type: String },
	price: { type: Number, required: true },
	images: { type: [String] },
	deliveryWay: {
		type: String,
		enum: ["COURIER", "POSTAL", "PICKUP"],
		default: "PICKUP",
	},
	deliveryPrice: { type: Number },
	deliveryPeriod: { type: String },
	quantity: { type: Number },
});

module.exports = model("Product", ProductSchema);
