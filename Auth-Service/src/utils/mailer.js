const nodemailer = require('nodemailer');

async function getTransporter() {
    const user = process.env.SMTP_USER || process.env.GMAIL_USER || process.env.GMAIL_EMAIL;
    const pass = process.env.SMTP_PASS || process.env.GMAIL_PASS || process.env.GMAIL_PASSWORD;
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';

    if (user && pass) {
        console.log(`[Mailer] Configuring custom SMTP/Gmail transporter for: ${user}`);
        if (host.includes('gmail') || user.includes('@gmail.com')) {
            return nodemailer.createTransport({
                service: 'gmail',
                auth: { user, pass }
            });
        }
        return nodemailer.createTransport({
            host: host,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_PORT === '465',
            auth: { user, pass }
        });
    }

    console.log('[Mailer] No custom SMTP credentials found. Creating test account...');
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass
        }
    });
}

async function sendVerificationEmail(email, token) {
    const gatewayUrl = process.env.API_GATEWAY_URL || 'http://localhost:3005';
    const verificationLink = `${gatewayUrl}/api/v1/users/verify?token=${token}`;

    console.log('\n==================================================');
    console.log(`✉️  PREPARING VERIFICATION EMAIL FOR: ${email}`);
    console.log(`👉 Link: ${verificationLink}`);
    console.log('==================================================\n');

    try {
        const transporter = await getTransporter();
        const senderUser = process.env.SMTP_USER || process.env.GMAIL_USER || 'no-reply@makemytrip.com';

        const info = await transporter.sendMail({
            from: `"MakeMyTrip Support" <${senderUser}>`,
            to: email,
            subject: 'Verify Your MakeMyTrip Account',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h2 style="color: #2563eb; margin-top: 0;">Welcome to MakeMyTrip!</h2>
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

        console.log(`[Mailer] ✅ Email successfully sent to ${email}! Message ID: ${info.messageId}`);
    } catch (err) {
        console.error('[Mailer] ❌ Error while sending email:', err.message);
    }
}

async function sendResetPasswordEmail(email, token) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/?resetToken=${token}`;

    console.log('\n==================================================');
    console.log(`✉️  PREPARING PASSWORD RESET EMAIL FOR: ${email}`);
    console.log(`👉 Link: ${resetLink}`);
    console.log('==================================================\n');

    try {
        const transporter = await getTransporter();
        const senderUser = process.env.SMTP_USER || process.env.GMAIL_USER || 'no-reply@makemytrip.com';

        const info = await transporter.sendMail({
            from: `"MakeMyTrip Support" <${senderUser}>`,
            to: email,
            subject: 'Reset Your MakeMyTrip Password',
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

        console.log(`[Mailer] ✅ Reset email successfully sent to ${email}! Message ID: ${info.messageId}`);
    } catch (err) {
        console.error('[Mailer] ❌ Error while sending reset email:', err.message);
    }
}

module.exports = { sendVerificationEmail, sendResetPasswordEmail };

