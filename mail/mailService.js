const nodemailer = require('nodemailer');
const admin = require('firebase-admin');

class MailService {
    constructor() {
        this.transporter = null;
    }

    // Асинхронно ініціалізуємо транспортер
    async initialize() {
        try {
            const remoteConfig = admin.remoteConfig();
            const template = await remoteConfig.getTemplate();
            const smpt = template.parameters['SMTP'] ? template.parameters['SMTP'].defaultValue.value : null;
        
            this.transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: 'coffeeapimail@gmail.com',
                    pass: smpt,
                },
            });
        } catch (error) {
            console.error('Error during initialization:', error);
            throw new Error('Failed to initialize mail transporter');
        }
    }

   
    async sendActivationMail(to, link) {
        if (!this.transporter) {
            throw new Error('Mail service not initialized');
        }

        try {
            await this.transporter.sendMail({
                from: 'coffeeapimail@gmail.com',
                to,
                subject: 'Account Activation',
                html: `
                    <div style="font-family: Arial, sans-serif; text-align: center; background-color: #f9f9f9; padding: 20px; border-radius: 10px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
                        <h1 style="color: #4CAF50;">Welcome to our website!</h1>
                        <p style="font-size: 16px; color: #555;">To complete your registration, please click the link below:</p>
                        <a href="${link}" style="display: inline-block; margin: 20px auto; padding: 10px 20px; font-size: 18px; color: #fff; background-color: #4CAF50; text-decoration: none; border-radius: 5px;">Activate Account</a>
                        <p style="font-size: 14px; color: #888;">If you did not register on our website, please ignore this email.</p>
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                        <p style="font-size: 12px; color: #aaa;">© 2025 Your Website. All rights reserved.</p>
                    </div>
                `,
            });
        } catch (error) {
            console.error('Error while sending email:', error);
            throw ApiError.InternalError('Failed to send activation mail');
        }
    }
}

module.exports = new MailService();
