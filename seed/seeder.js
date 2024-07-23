const mongoose = require("mongoose");
const Product = require("../models/product.model");
const Customer = require("../models/customer.model");
const Order = require("../models/order.model");
const dotenv = require("dotenv");
dotenv.config();

const sampleProducts = [
	{
		name: "Apple MacBook Air M1",
		description:
			"Apple MacBook Air with M1 chip, 13.3-inch Retina display, 8GB RAM, 256GB SSD.",
		price: 999,
		image:
			"https://scdn.comfy.ua/89fc351a-22e7-41ee-8321-f8a9356ca351/https://cdn.comfy.ua/media/catalog/product/w/w/wwru_macbook-air_q121_spacegray_pdp-image-1.jpg/w_600",
		deliveryOptions: [{ type: "COURIER", price: 10, period: "5-7 days" }],
		quantity: 10,
	},
	{
		name: "Samsung Galaxy S21",
		description:
			"Samsung Galaxy S21, 128GB, Phantom Gray. Featuring a 6.2-inch display and triple camera system.",
		price: 799,
		image:
			"https://scdn.comfy.ua/89fc351a-22e7-41ee-8321-f8a9356ca351/https://cdn.comfy.ua/media/catalog/product/s/m/sm-s711_galaxys23fe_front_graphite_1_.jpg/w_600",
		deliveryOptions: [{ type: "POSTAL", price: 5, period: "7-10 days" }],
		quantity: 50,
	},
	{
		name: "Apple iPad Pro 12.9",
		description: "Apple iPad Pro 12.9-inch, M1 chip, 128GB, Wi-Fi, Space Gray.",
		price: 1099,
		image:
			"https://scdn.comfy.ua/89fc351a-22e7-41ee-8321-f8a9356ca351/https://cdn.comfy.ua/media/catalog/product/i/p/ipad-2022-hero-blue-wifi-select_1__3.jpg/w_600",
		deliveryOptions: [
			{ type: "PICKUP", price: 0, period: "Immediate" },
			{ type: "POSTAL", price: 5, period: "7-10 days" },
		],
		quantity: 101,
	},
	{
		name: "Google Pixel 6",
		description:
			"Google Pixel 6 with Google Tensor chip, 6.4-inch display, 128GB storage, Sorta Seafoam.",
		price: 599,
		image: "https://cdn.tehnoezh.ua/0/0/0/1/5/5/4/7/1/000155471_545_545.jpeg",
		deliveryOptions: [{ type: "PICKUP", price: 0, period: "Immediate" }],
		quantity: 101,
	},
	{
		name: "Dell XPS 13",
		description:
			"Dell XPS 13 Laptop, 13.4-inch FHD display, Intel Core i7, 16GB RAM, 512GB SSD, Silver.",
		price: 1299,
		image:
			"https://scdn.comfy.ua/89fc351a-22e7-41ee-8321-f8a9356ca351/https://cdn.comfy.ua/media/catalog/product/v/f/vfe08af24_11__1.jpg/w_600",
		deliveryOptions: [{ type: "PICKUP", price: 0, period: "Immediate" }],
		quantity: 101,
	},
	{
		name: "Samsung Galaxy Tab S7",
		description:
			"Samsung Galaxy Tab S7, 11-inch display, 128GB, Wi-Fi, Mystic Black.",
		price: 649,
		image: "https://files.foxtrot.com.ua/PhotoNew/img_0_1112_2057_10_1.webp",
		deliveryOptions: [{ type: "PICKUP", price: 0, period: "Immediate" }],
		quantity: 60,
	},
	{
		name: "Sony WH-1000XM4",
		description:
			"Sony WH-1000XM4 Wireless Noise-Canceling Over-Ear Headphones, Black.",
		price: 349,
		image:
			"https://scdn.comfy.ua/89fc351a-22e7-41ee-8321-f8a9356ca351/https://cdn.comfy.ua/media/catalog/product/_/8/_8_37_6_6_7__1.jpg/w_600",
		deliveryOptions: [{ type: "PICKUP", price: 0, period: "Immediate" }],
		quantity: 0,
	},
];

const seedDB = async () => {
	try {
		console.log("db url", process.env.DB_URL);
		await mongoose.connect(process.env.DB_URL, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});

		await Product.deleteMany({});
		await Customer.deleteMany({});
		await Order.deleteMany({});

		await Product.insertMany(sampleProducts);

		console.log("Database seeded successfully");
		mongoose.connection.close();
	} catch (error) {
		console.error("Error seeding the database:", error);
		mongoose.connection.close();
	}
};

seedDB();
