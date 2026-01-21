/**
 * EMAIL SERVICE
 * Sử dụng Nodemailer để gửi email
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

export class EmailService {
    static async sendResetEmail(toEmail, resetLink) {
        // Enhanced logging for debugging
        console.log('[EmailService] Checking email configuration...');
        console.log(`[EmailService] EMAIL_USER exists: ${!!EMAIL_USER}`);
        console.log(`[EmailService] EMAIL_PASS exists: ${!!EMAIL_PASS}`);
        console.log(`[EmailService] EMAIL_USER value: ${EMAIL_USER ? EMAIL_USER.substring(0, 5) + '***' : 'UNDEFINED'}`);

        if (!EMAIL_USER || !EMAIL_PASS) {
            console.error('[EmailService] Email configuration missing (EMAIL_USER or EMAIL_PASS)');
            console.error(`[EmailService] All env vars: ${Object.keys(process.env).filter(k => k.includes('EMAIL')).join(', ')}`);
            return false;
        }

        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: EMAIL_USER,
                    pass: EMAIL_PASS
                }
            });

            const mailOptions = {
                from: `"Thái Mậu Operation App" <${EMAIL_USER}>`,
                to: toEmail,
                subject: 'Yêu cầu đặt lại mật khẩu',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                        <h2 style="color: #004AAD; text-align: center;">YÊU CẦU ĐẶT LẠI MẬT KHẨU</h2>
                        <p>Xin chào,</p>
                        <p>Bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu cho tài khoản nhân viên.</p>
                        <p>Vui lòng nhấn vào nút bên dưới để đặt lại mật khẩu của bạn:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetLink}" style="background-color: #004AAD; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">ĐẶT LẠI MẬT KHẨU</a>
                        </div>
                        <p style="color: #666; font-size: 13px;">Link này sẽ hết hạn sau 15 phút.</p>
                        <p style="color: #666; font-size: 13px;">Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="color: #999; font-size: 11px; text-align: center;">Thái Mậu Group Operation App</p>
                    </div>
                `
            };

            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent: ' + info.response);
            return true;

        } catch (error) {
            console.error('Error sending email:', error);
            return false;
        }
    }
}
