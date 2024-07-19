const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const router = require("./routes/router");
const errorMiddleware = require("./middlewares/error.middleware");
const mongoose = require("mongoose");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
	cors({
		credentials: true,
		origin: process.env.FRONTEND_URL,
	}),
);

const options = {
	definition: {
		openapi: "3.1.0",
		info: {
			title: "Express API for Ordify",
			version: "0.1.0",
			description:
				"This is a REST  API application made with Express and documented with Swagger",
		},
		servers: [
			{
				url: process.env.BACKEND_URL,
				description: "Development server",
			},
		],
	},
	apis: ["./routes/*.js"],
};

const specs = swaggerJsdoc(options);
const CSS_URL =
	"https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";

app.use(
	"/",
	router,
	swaggerUi.serve,
	swaggerUi.setup(specs, { customCssUrl: CSS_URL }),
);
app.use(errorMiddleware);

const start = async () => {
	try {
		mongoose.connect(process.env.DB_URL);
		app.listen(process.env.PORT, () => {
			console.log(`Application started on port ${process.env.PORT}`);
		});
	} catch (e) {
		console.log(e);
	}
};

start();
