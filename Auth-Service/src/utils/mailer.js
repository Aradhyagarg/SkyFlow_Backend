const nodemailer = require('nodemailer');

async function sendVerificationEmail(email, token) {
    const verificationLink = `http://localhost:5001/api/v1/users/verify?token=${token}`;
    
    console.log('\n==================================================');
    console.log(`✉️  EMAIL VERIFICATION LINK FOR: ${email}`);
    console.log(`👉 ${verificationLink}`);
    console.log('==================================================\n');

    try {
        let transporter;
        
        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
            console.log('[Mailer] Using custom SMTP configuration...');
            transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || '587'),
                secure: process.env.SMTP_PORT === '465',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });
        } else {
            console.log('[Mailer] Custom SMTP details not provided. Creating test account...');
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: testAccount.smtp.host,
                port: testAccount.smtp.port,
                secure: testAccount.smtp.secure,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass
                }
            });
        }

        const senderUser = process.env.SMTP_USER || 'no-reply@makemytrip.com';

        const info = await transporter.sendMail({
            from: `"MakeMyTrip Support" <${senderUser}>`,
            to: email,
            subject: 'Verify Your MakeMyTrip Account',
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2>Welcome to MakeMyTrip!</h2>
                    <p>Thank you for registering. Please click the button below to verify your email address and activate your account:</p>
                    <div style="margin: 30px 0;">
                        <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Verify Email Address</a>
                    </div>
                    <p>Or copy and paste this link in your browser:</p>
                    <p><a href="${verificationLink}">${verificationLink}</a></p>
                    <p>If you did not request this, you can ignore this email.</p>
                </div>
            `
        });

        console.log(`[Mailer] Message sent: ${info.messageId}`);
        if (!process.env.SMTP_HOST) {
            console.log(`[Mailer] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        }
    } catch (err) {
        console.error('[Mailer] Error while sending email:', err);
        console.log('[Mailer] Email delivery failed. Please copy the console link above to verify manually.');
    }
}

async function sendResetPasswordEmail(email, token) {
    const resetLink = `http://localhost:5173/?resetToken=${token}`;
    
    console.log('\n==================================================');
    console.log(`✉️  PASSWORD RESET LINK FOR: ${email}`);
    console.log(`👉 ${resetLink}`);
    console.log('==================================================\n');

    try {
        let transporter;
        
        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
            console.log('[Mailer] Using custom SMTP configuration...');
            transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || '587'),
                secure: process.env.SMTP_PORT === '465',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });
        } else {
            console.log('[Mailer] Custom SMTP details not provided. Creating test account...');
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: testAccount.smtp.host,
                port: testAccount.smtp.port,
                secure: testAccount.smtp.secure,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass
                }
            });
        }

        const senderUser = process.env.SMTP_USER || 'no-reply@makemytrip.com';

        const info = await transporter.sendMail({
            from: `"MakeMyTrip Support" <${senderUser}>`,
            to: email,
            subject: 'Reset Your MakeMyTrip Password',
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2>Reset Your Password</h2>
                    <p>We received a request to reset your password. Please click the button below to set a new password:</p>
                    <div style="margin: 30px 0;">
                        <a href="${resetLink}" style="background-color: #f43f5e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Reset Password</a>
                    </div>
                    <p>Or copy and paste this link in your browser:</p>
                    <p><a href="${resetLink}">${resetLink}</a></p>
                    <p>This link will expire in 15 minutes. If you did not request this, you can ignore this email.</p>
                </div>
            `
        });

        console.log(`[Mailer] Message sent: ${info.messageId}`);
        if (!process.env.SMTP_HOST) {
            console.log(`[Mailer] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        }
    } catch (err) {
        console.error('[Mailer] Error while sending email:', err);
        console.log('[Mailer] Email delivery failed. Please copy the console link above to reset manually.');
    }
}

module.exports = { sendVerificationEmail, sendResetPasswordEmail };
