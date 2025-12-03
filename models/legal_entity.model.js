const { Schema, model } = require("mongoose");

const LegalEntitySchema = new Schema({
	name: { type: String, required: true },
	legalAddress: {
		street: { type: String },
		city: { type: String },
		state: { type: String },
		zip: { type: String },
	},
	registrationNumber: { type: String },
	directorName: { type: String },
	bankAccount: {
		name: { type: String },
		iban: { type: String },
	},
});

module.exports = model("LegalEntity", LegalEntitySchema);
