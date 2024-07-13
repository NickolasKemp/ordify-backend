const userModel = require("../models/user.model");

class UserService {
	async getUsers() {
		return await userModel.find();
	}
}

module.exports = new UserService();
