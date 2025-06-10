const nodemailer = require('nodemailer');
const admin = require('firebase-admin');

class MailService {
    constructor() {
        this.transporter = null;
    }

    
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
                    user: 'cbee.info@gmail.com',
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
                from: 'cbee.info@gmail.com',
                to,
               subject: 'Reset your password - Coffee Bee',
                html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #fefefe; padding: 30px; max-width: 600px; margin: 0 auto; border-radius: 16px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08); text-align: center;">
                    <h1 style="color: #ff9f43; margin-bottom: 10px;">☕ Coffee Bee</h1>
                    <h2 style="color: #333; margin-bottom: 20px;">Reset your password</h2>
                    <p style="font-size: 16px; color: #444;">You requested to reset your password. Click the button below to create a new one and get back to enjoying your coffee moments.</p>
                    <a href="${link}" style="display: inline-block; margin-top: 25px; padding: 14px 32px; background-color: #ff9f43; color: #fff; font-size: 16px; border-radius: 10px; text-decoration: none; font-weight: 600; transition: background 0.3s ease;">Reset Password</a>
                    <p style="font-size: 14px; color: #999; margin-top: 30px;">Didn't request this? Just ignore this message, and nothing will change.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;">
                    <p style="font-size: 12px; color: #bbb;">© 2025 Coffee Bee. All rights reserved.</p>
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
