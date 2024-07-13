const { Schema, model } = require("mongoose");

const UserSchema = new Schema({
	created_at: { type: Date, required: true, default: Date.now },

	quantity: { type: Number },
	price: { type: Number },
	product: { type: Schema.ObjectId, ref: "Product", required: true },
	customer: { type: Schema.ObjectId, ref: "Customer", required: true },
	deliveryWay: {
		type: String,
		enum: ["COURIER", "POSTAL", "PICKUP"],
	},
});

module.exports = model("Order", UserSchema);
