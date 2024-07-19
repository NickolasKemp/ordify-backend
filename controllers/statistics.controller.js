const statisticsService = require("../services/statistics.service");

class StatisticsController {
	async getMain(req, res, next) {
		try {
			const main = await statisticsService.getMain();
			return res.json(main);
		} catch (e) {
			next(e);
		}
	}
}

module.exports = new StatisticsController();
