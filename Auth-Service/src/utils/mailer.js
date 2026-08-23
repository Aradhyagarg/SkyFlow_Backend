const { createTransport } = require('nodemailer');
const dns = require('dns');

// Force Node.js DNS to prefer IPv4 over IPv6 to prevent ENETUNREACH errors on cloud hosts like Render
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

const createMailerTransporter = () => {
    return createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        family: 4,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });
};

const sendVerificationEmail = async (email, token) => {
    const gatewayUrl = process.env.API_GATEWAY_URL || 'http://localhost:3005';
    const verificationLink = `${gatewayUrl}/api/v1/users/verify?token=${token}`;

    const transporter = createMailerTransporter();
    const senderUser = process.env.SMTP_USER || 'no-reply@skyflow.com';

    await transporter.sendMail({
        from: `"SkyFlow Support" <${senderUser}>`,
        to: email,
        subject: 'Verify Your SkyFlow Account',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #2563eb; margin-top: 0;">Welcome to SkyFlow!</h2>
                <p>Thank you for registering. Please click the button below to verify your email address and activate your account:</p>
                <div style="margin: 30px 0; text-align: center;">
                    <a href="${verificationLink}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email Address</a>
                </div>
                <p>Or copy and paste this link in your browser:</p>
                <p style="word-break: break-all;"><a href="${verificationLink}" style="color: #2563eb;">${verificationLink}</a></p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="font-size: 0.85rem; color: #64748b;">If you did not request this, you can safely ignore this email.</p>
            </div>
        `
    });
};

const sendResetPasswordEmail = async (email, token) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/?resetToken=${token}`;

    const transporter = createMailerTransporter();
    const senderUser = process.env.SMTP_USER || 'no-reply@skyflow.com';

    await transporter.sendMail({
        from: `"SkyFlow Support" <${senderUser}>`,
        to: email,
        subject: 'Reset Your SkyFlow Password',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #ef4444; margin-top: 0;">Reset Your Password</h2>
                <p>We received a request to reset your password. Please click the button below to set a new password:</p>
                <div style="margin: 30px 0; text-align: center;">
                    <a href="${resetLink}" style="background-color: #ef4444; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
                </div>
                <p>Or copy and paste this link in your browser:</p>
                <p style="word-break: break-all;"><a href="${resetLink}" style="color: #ef4444;">${resetLink}</a></p>
                <p style="font-size: 0.85rem; color: #64748b;">This link will expire in 15 minutes. If you did not request this, you can ignore this email.</p>
            </div>
        `
    });
};

module.exports = { sendVerificationEmail, sendResetPasswordEmail };
