/**
 * EMAIL SERVICE
 * Sử dụng SendGrid API để gửi email
 */

import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@vinhhua.com';

// Initialize SendGrid
if (SENDGRID_API_KEY) {
    sgMail.setApiKey(SENDGRID_API_KEY);
}

export class EmailService {
    static async sendResetEmail(toEmail, resetLink) {
        // Enhanced logging for debugging
        console.log('[EmailService] Checking SendGrid configuration...');
        console.log(`[EmailService] SENDGRID_API_KEY exists: ${!!SENDGRID_API_KEY}`);
        console.log(`[EmailService] EMAIL_FROM: ${EMAIL_FROM}`);
        console.log(`[EmailService] Sending to: ${toEmail}`);

        if (!SENDGRID_API_KEY) {
            console.error('[EmailService] SendGrid API key missing');
            return false;
        }

        if (!toEmail) {
            console.error('[EmailService] Recipient email is missing');
            return false;
        }

        try {
            const msg = {
                to: toEmail,
                from: EMAIL_FROM,
                subject: 'Yêu cầu đặt lại mật khẩu - Thái Mậu Group',
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

            await sgMail.send(msg);
            console.log('[EmailService] Email sent successfully via SendGrid');
            return true;

        } catch (error) {
            console.error('[EmailService] Error sending email:', error);
            if (error.response) {
                console.error('[EmailService] SendGrid error details:', error.response.body);
            }
            return false;
        }
    }
}
