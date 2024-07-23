const mongoose = require("mongoose");
const Product = require("../models/product.model");
const Customer = require("../models/customer.model");
const Order = require("../models/order.model");
const User = require("../models/user.model");
const dotenv = require("dotenv");
dotenv.config();

const sampleProducts = [
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
		quantity: 110,
	},
	{
		name: "Samsung Galaxy S21",
		description:
			"Samsung Galaxy S21, 128GB, Phantom Gray. Featuring a 6.2-inch display and triple camera system.",
		price: 799,
		image:
			"https://scdn.comfy.ua/89fc351a-22e7-41ee-8321-f8a9356ca351/https://cdn.comfy.ua/media/catalog/product/s/m/sm-s711_galaxys23fe_front_graphite_1_.jpg/w_600",
		deliveryOptions: [
			{ type: "POSTAL", price: 5, period: "7-10 days" },
			{ type: "PICKUP", price: 0, period: "Immediate" },
		],
		quantity: 50,
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
		name: "Apple iPad Air (2022)",
		description:
			"Apple iPad Air with M1 chip, 10.9-inch Liquid Retina display, 64GB storage.",
		price: 599,
		image: "https://content1.rozetka.com.ua/goods/images/big/224013224.jpg",
		deliveryOptions: [
			{ type: "POSTAL", price: 7, period: "5-7 days" },
			{ type: "PICKUP", price: 0, period: "Immediate" },
		],
		quantity: 40,
	},
	{
		name: "Microsoft Surface Pro 7",
		description:
			"Microsoft Surface Pro 7 with Intel Core i5, 8GB RAM, 128GB SSD, 12.3-inch PixelSense display.",
		price: 749,
		image: "https://content2.rozetka.com.ua/goods/images/big/450029390.png",
		deliveryOptions: [
			{ type: "POSTAL", price: 6, period: "5-7 days" },
			{ type: "PICKUP", price: 0, period: "Immediate" },
		],
		quantity: 20,
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
		deliveryOptions: [
			{ type: "PICKUP", price: 0, period: "Immediate" },
			{ type: "POSTAL", price: 20, period: "5-7 days" },
		],
		quantity: 0,
	},
	{
		name: "HP Spectre x360",
		description:
			"HP Spectre x360 Convertible Laptop with Intel Core i7, 16GB RAM, 512GB SSD, 13.3-inch OLED display.",
		price: 1399,
		image:
			"https://scdn.comfy.ua/89fc351a-22e7-41ee-8321-f8a9356ca351/https://cdn.comfy.ua/media/catalog/product/3/c/3cece500eb3011edad9600155d05f304_80b683bafb0411edad9600155d05f304_10_1.jpg/w_600",
		deliveryOptions: [
			{ type: "COURIER", price: 15, period: "3-5 days" },
			{ type: "PICKUP", price: 0, period: "Immediate" },
		],
		quantity: 10,
	},
	{
		name: "Lenovo ThinkPad X1 Carbon",
		description:
			"Lenovo ThinkPad X1 Carbon with Intel Core i7, 16GB RAM, 512GB SSD, 14-inch WQHD display.",
		price: 1399,
		image: "https://content.rozetka.com.ua/goods/images/big/348752544.jpg",
		deliveryOptions: [
			{ type: "COURIER", price: 15, period: "3-5 days" },
			{ type: "PICKUP", price: 0, period: "Immediate" },
			{ type: "POSTAL", price: 20, period: "5-7 days" },
		],
		quantity: 18,
	},
	{
		name: "Canon EOS R5",
		description:
			"Canon EOS R5 Mirrorless Camera with 45MP Full-Frame Sensor, 8K Video Recording, and Dual Pixel AF.",
		price: 3899,
		image:
			"https://scdn.comfy.ua/89fc351a-22e7-41ee-8321-f8a9356ca351/https://cdn.comfy.ua/media/catalog/product/c/a/canon_eos_r50_rf-s_18-45_is_stm_black_5811c033_8_.jpg/w_600",
		deliveryOptions: [
			{ type: "POSTAL", price: 20, period: "5-7 days" },
			{ type: "PICKUP", price: 0, period: "Immediate" },
		],
		quantity: 7,
	},
	{
		name: "Apple MacBook Air M1",
		description:
			"Apple MacBook Air with M1 chip, 13.3-inch Retina display, 8GB RAM, 256GB SSD.",
		price: 999,
		image:
			"https://scdn.comfy.ua/89fc351a-22e7-41ee-8321-f8a9356ca351/https://cdn.comfy.ua/media/catalog/product/w/w/wwru_macbook-air_q121_spacegray_pdp-image-1.jpg/w_600",
		deliveryOptions: [{ type: "PICKUP", price: 0, period: "Immediate" }],
		quantity: 10,
	},
	{
		name: "Fitbit Charge 5",
		description:
			"Fitbit Charge 5 Fitness and Health Tracker with GPS, Heart Rate Monitoring, and 7-Day Battery Life.",
		price: 149,
		image:
			"https://scdn.comfy.ua/89fc351a-22e7-41ee-8321-f8a9356ca351/https://cdn.comfy.ua/media/catalog/product/r/s/rs13898_cns-sb75bb_6-1024x1024.jpg/w_600",
		deliveryOptions: [
			{ type: "COURIER", price: 6, period: "3-5 days" },
			{ type: "PICKUP", price: 0, period: "Immediate" },
		],
		quantity: 60,
	},
	{
		name: "Asus ROG Zephyrus G14",
		description:
			"Asus ROG Zephyrus G14 Gaming Laptop with AMD Ryzen 9, 16GB RAM, 1TB SSD, 14-inch FHD display.",
		price: 1299,
		image:
			"https://scdn.comfy.ua/89fc351a-22e7-41ee-8321-f8a9356ca351/https://cdn.comfy.ua/media/catalog/product/a/s/asus-rog-zephyrus-g16-gu605mv-n4073-90nr0it3-m002k0-eclipse-gray.jpg/w_600",
		deliveryOptions: [
			{ type: "COURIER", price: 12, period: "3-5 days" },
			{ type: "PICKUP", price: 0, period: "Immediate" },
		],
		quantity: 20,
	},
	{
		name: "Apple Watch Series 7",
		description:
			"Apple Watch Series 7 with 45mm display, GPS + Cellular, and Blood Oxygen Monitoring.",
		price: 399,
		image: "https://content.rozetka.com.ua/goods/images/big/364840999.jpg",
		deliveryOptions: [
			{ type: "POSTAL", price: 7, period: "5-7 days" },
			{ type: "PICKUP", price: 0, period: "Immediate" },
		],
		quantity: 40,
	},
	{
		name: "Apple MacBook Air M3",
		description: "Apple MacBook Air 13.6 M3 8/256GB 2024 (MRXV3UA/A) Midnight",
		price: 999,
		image: "https://content.rozetka.com.ua/goods/images/big/414329731.jpg",
		deliveryOptions: [
			{ type: "COURIER", price: 10, period: "5-7 days" },
			{ type: "PICKUP", price: 0, period: "Immediate" },
			{ type: "POSTAL", price: 7, period: "5-7 days" },
		],
		quantity: 10,
	},
];

// password: 12345
const defaultUser = {
	email: "test@gmail.com",
	password: "$2a$12$cO.bTeKhaoimTs1IjaXo7OB4/LfuBgp5jy/RBgfMJeQpzTNrmikMe",
	activationLink: "not-existing-link",
	isActivated: true,
};

const seedDB = async () => {
	try {
		console.log("db url", process.env.DB_URL);
		await mongoose.connect(process.env.DB_URL, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});

		await User.deleteMany({});
		await Product.deleteMany({});
		await Customer.deleteMany({});
		await Order.deleteMany({});

		await User.create(defaultUser);
		await Product.insertMany(sampleProducts);

		console.log("Database seeded successfully");
		mongoose.connection.close();
	} catch (error) {
		console.error("Error seeding the database:", error);
		mongoose.connection.close();
	}
};

seedDB();
