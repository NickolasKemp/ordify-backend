const userService = require("../services/user.service");

class UserController {
	async getUsers(req, res, next) {
		try {
			const users = await userService.getUsers();
			return res.json(users);
		} catch (e) {
			next(e);
		}
	}
}

module.exports = new UserController();
