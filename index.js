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

const corsOptions = {
	credentials: true,
	origin: function (origin, callback) {
		if (!origin) return callback(null, true);
		if (origin === process.env.FRONTEND_URL) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS"));
		}
	},
};
app.use(cors(corsOptions));

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
				url: "https://ordify-backend.onrender.com/",
				description: "Production server",
			},
			{
				url: "http://localhost:3005",
				description: "Development server",
			},
		],
	},
	apis: ["./routes/*.js"],
};

const specs = swaggerJsdoc(options);

app.use(
	"/",
	router,
	swaggerUi.serve,
	swaggerUi.setup(specs, {
		customSiteTitle: "Ordify API Docs",
	}),
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
