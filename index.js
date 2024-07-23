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
				url: "https://ordify-backend.vercel.app/",
				description: "Production server",
			},
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
	swaggerUi.setup(specs, {
		customSiteTitle: "Ordify API Docs",
		customfavIcon:
			"https://pbs.twimg.com/profile_images/1451297216187011072/xLd1JSZk_400x400.png",
		customCssUrl: CSS_URL,
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
