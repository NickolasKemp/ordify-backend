const express = require("express");
const cookieParser = require("cookie-parser");
const router = require("../routes/router");
const errorMiddleware = require("../middlewares/error.middleware");

const createApp = () => {
	const app = express();
	app.use(express.json());
	app.use(cookieParser());
	app.use("/", router);
	app.use(errorMiddleware);
	return app;
};

module.exports = createApp;
