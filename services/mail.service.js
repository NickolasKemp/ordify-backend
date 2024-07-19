const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

class MailService {
	constructor() {
		{
			this.transporter = nodemailer.createTransport({
				host: process.env.SMTP_HOST,
				port: process.env.SMTP_PORT,
				secure: false,
				auth: {
					user: process.env.SMTP_USER,
					pass: process.env.SMTP_PASS,
				},
			});
		}
	}

	async sendActivationMail(link, email) {
		await this.transporter.sendMail({
			from: process.env.SMTP_USER,
			to: process.env.ADMIN_EMAIL,
			subject: `Activation of account with email ${email} on our site ${process.env.BACKEND_URL}`,
			text: "",
			html: ` 
          <div>
            <h1>For activation this account follow the link below</h1>
						<h2>
						<a href="${link}">activate</a>
						</h2>
          </div>
          `,
		});
	}
}

module.exports = new MailService();
