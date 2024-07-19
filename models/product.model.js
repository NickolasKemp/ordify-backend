const { Schema, model } = require("mongoose");
const Order = require("./order.model");

const DeliveryOptionSchema = new Schema({
	type: {
		type: String,
		enum: ["COURIER", "POSTAL", "PICKUP"],
		required: true,
		default: "POSTAL",
	},
	price: { type: Number, required: true, default: 0 },
	period: { type: String, required: true, default: "Immediate" },
});

const ProductSchema = new Schema({
	createdAt: { type: Date, required: true, default: Date.now },
	name: { type: String },
	description: { type: String },
	price: { type: Number, required: true },
	image: { type: String },
	deliveryOptions: [DeliveryOptionSchema],
	quantity: { type: Number },
});

ProductSchema.pre("findOneAndDelete", async function (next) {
	const productId = this.getQuery()["_id"];
	await Order.deleteMany({ product: productId });
	next();
});

module.exports = model("Product", ProductSchema);
