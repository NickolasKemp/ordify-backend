const { Schema, model } = require("mongoose");

const AgreementSchema = new Schema({
	created_at: { type: Date, required: true, default: Date.now },
	ends_at: { type: Date, required: true },
	customer: { type: Schema.ObjectId, ref: "Customer", required: true },
	legalEntity: { type: Schema.ObjectId, ref: "LegalEntity" },
	// Token for client identification for future orders under this agreement
	clientToken: { type: String, unique: true, required: true },
	isActive: { type: Boolean, default: true },
});

// Index for faster token lookups
AgreementSchema.index({ clientToken: 1 });

module.exports = model("Agreement", AgreementSchema);
