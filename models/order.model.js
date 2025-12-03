const { Schema, model } = require("mongoose");

const OrderSchema = new Schema({
	created_at: { type: Date, required: true, default: Date.now },

	quantity: { type: Number },
	price: { type: Number },
	product: { type: Schema.ObjectId, ref: "Product", required: true },
	customer: { type: Schema.ObjectId, ref: "Customer", required: true },
	deliveryWay: {
		type: String,
		enum: ["COURIER", "POSTAL", "PICKUP"],
	},
	// Payment fields (Stripe integration)
	paymentStatus: {
		type: String,
		enum: ["pending", "paid", "failed"],
		default: "pending",
	},
	paymentIntentId: { type: String },
	paidAt: { type: Date },
});

module.exports = model("Order", OrderSchema);
