const mongoose = require("mongoose");
const Product = require("../models/product.model");
const Customer = require("../models/customer.model");
const Order = require("../models/order.model");

const sampleProducts = [
	{
		name: "Product 1",
		description: "Description for Product 1",
		price: 100,
		images: [
			"https://scdn.comfy.ua/89fc351a-22e7-41ee-8321-f8a9356ca351/https://cdn.comfy.ua/media/catalog/product/w/w/wwru_macbook-air_q121_spacegray_pdp-image-1.jpg/w_600",
			"https://scdn.comfy.ua/89fc351a-22e7-41ee-8321-f8a9356ca351/https://cdn.comfy.ua/media/catalog/product/w/w/wwru_macbook-air_q121_spacegray_pdp-image-2.jpg/w_600",
		],
		deliveryWay: "COURIER",
		deliveryPrice: 10,
		deliveryPeriod: "5-7 days",
		quantity: 10,
	},
	{
		name: "Product 2",
		description: "Description for Product 2",
		price: 200,
		images: [
			"https://scdn.comfy.ua/89fc351a-22e7-41ee-8321-f8a9356ca351/https://cdn.comfy.ua/media/catalog/product/w/_/w_600_4_10.jpg/w_600",
			"image4.jpg",
		],
		deliveryWay: "POSTAL",
		deliveryPrice: 5,
		deliveryPeriod: "7-10 days",
		quantity: 50,
	},
	{
		name: "Product 3",
		description: "Description for Product 3",
		price: 150,
		images: [
			"https://scdn.comfy.ua/89fc351a-22e7-41ee-8321-f8a9356ca351/https://cdn.comfy.ua/media/catalog/product/w/_/w_600_4_10.jpg/w_600",
			"image6.jpg",
		],
		deliveryWay: "PICKUP",
		deliveryPrice: 0,
		deliveryPeriod: "Immediate",
		quantity: 101,
	},
	{
		name: "Product 4",
		description: "Description for Product 3",
		price: 150,
		images: [
			"https://scdn.comfy.ua/89fc351a-22e7-41ee-8321-f8a9356ca351/https://cdn.comfy.ua/media/catalog/product/w/_/w_600_4_10.jpg/w_600",
			"image6.jpg",
		],
		deliveryWay: "PICKUP",
		deliveryPrice: 0,
		deliveryPeriod: "Immediate",
		quantity: 101,
	},
	{
		name: "Product 5",
		description: "Description for Product 3",
		price: 150,
		images: [
			"https://scdn.comfy.ua/89fc351a-22e7-41ee-8321-f8a9356ca351/https://cdn.comfy.ua/media/catalog/product/v/f/vfe08af24_11__1.jpg/w_600",
			"image6.jpg",
		],
		deliveryWay: "PICKUP",
		deliveryPrice: 0,
		deliveryPeriod: "Immediate",
		quantity: 101,
	},
	{
		name: "Product 6",
		description: "Description for Product 3",
		price: 150,
		images: [
			"https://files.foxtrot.com.ua/PhotoNew/img_0_1112_2265_0_1_638047061493814069.webp",
			"image6.jpg",
		],
		deliveryWay: "PICKUP",
		deliveryPrice: 0,
		deliveryPeriod: "Immediate",
		quantity: 60,
	},
	{
		name: "Product 7",
		description: "Description for Product 3",
		price: 150,
		images: [
			"https://scdn.comfy.ua/89fc351a-22e7-41ee-8321-f8a9356ca351/https://cdn.comfy.ua/media/catalog/product/_/8/_8_37_6_6_7__1.jpg/w_600",
		],
		deliveryWay: "PICKUP",
		deliveryPrice: 0,
		deliveryPeriod: "Immediate",
		quantity: 0,
	},
];

const seedDB = async () => {
	try {
		await mongoose.connect(
			// "mongodb+srv://kemplent:Z2xEsUvi2LDk7yX@ordify.akrpoao.mongodb.net/?retryWrites=true&w=majority&appName=Ordify",
			"mongodb://user:pass@localhost:27017/",
			{
				useNewUrlParser: true,
				useUnifiedTopology: true,
			},
		);

		// Clear the collections before seeding
		await Product.deleteMany({});
		await Customer.deleteMany({});
		await Order.deleteMany({});

		// Insert sample data
		await Product.insertMany(sampleProducts);

		console.log("Database seeded successfully");
		mongoose.connection.close();
	} catch (error) {
		console.error("Error seeding the database:", error);
		mongoose.connection.close();
	}
};

seedDB();
