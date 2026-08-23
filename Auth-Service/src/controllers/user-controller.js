const { UserService } = require('../services');
const { SuccessResponse } = require('../utils/common');
const { StatusCodes } = require('http-status-codes');

async function signup(req, res, next) {
    try {
        const user = await UserService.create({
            email: req.body.email,
            password: req.body.password
        });
        SuccessResponse.data = user;
        SuccessResponse.message = 'Successfully registered user';
        return res.status(StatusCodes.CREATED).json(SuccessResponse);
    } catch(error) {
        next(error);
    }
}

async function signin(req, res, next) {
    try {
        const jwtToken = await UserService.signin({
            email: req.body.email,
            password: req.body.password
        });
        SuccessResponse.data = { token: jwtToken };
        SuccessResponse.message = 'Successfully signed in user';
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch(error) {
        next(error);
    }
}

async function isAuthenticated(req, res, next) {
    try {
        // Accept token from x-access-token header
        const token = req.headers['x-access-token'];
        const user = await UserService.isAuthenticated(token);
        SuccessResponse.data = { userId: user.id, role: user.role };
        SuccessResponse.message = 'User is authenticated and token is valid';
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch(error) {
        next(error);
    }
}

async function verifyEmail(req, res, next) {
    const frontendUrl = process.env.FRONTEND_URL || 'https://sky-flow-frontend.vercel.app';
    try {
        await UserService.verifyEmail(req.query.token);
        return res.status(StatusCodes.OK).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta http-equiv="refresh" content="3;url=${frontendUrl}?verified=true" />
                <title>Email Verified - SkyFlow</title>
            </head>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
                <div style="background: #1e293b; padding: 40px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); text-align: center; max-width: 450px; border: 1px solid #334155;">
                    <div style="background: rgba(16, 185, 129, 0.1); width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto;">
                        <span style="color: #10b981; font-size: 36px; font-weight: bold;">✓</span>
                    </div>
                    <h1 style="color: #f8fafc; font-size: 1.8rem; font-weight: 700; margin-bottom: 10px;">Email Verified!</h1>
                    <p style="color: #94a3b8; font-size: 1rem; line-height: 1.5; margin-bottom: 24px;">Your SkyFlow account is now fully active.</p>
                    <p style="color: #38bdf8; font-size: 0.9rem; margin-bottom: 20px;">Redirecting you to the sign-in page in 3 seconds...</p>
                    <a href="${frontendUrl}?verified=true" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Go to Sign In Now →</a>
                </div>
            </body>
            </html>
        `);
    } catch(error) {
        return res.status(StatusCodes.BAD_REQUEST).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Verification Failed - SkyFlow</title>
            </head>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
                <div style="background: #1e293b; padding: 40px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); text-align: center; max-width: 450px; border: 1px solid #334155;">
                    <div style="background: rgba(244, 63, 94, 0.1); width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto;">
                        <span style="color: #f43f5e; font-size: 36px; font-weight: bold;">✕</span>
                    </div>
                    <h1 style="color: #f8fafc; font-size: 1.8rem; font-weight: 700; margin-bottom: 10px;">Verification Failed</h1>
                    <p style="color: #f43f5e; font-size: 0.95rem; line-height: 1.5; margin-bottom: 24px;">${error.message || 'Invalid or expired verification link.'}</p>
                    <a href="${frontendUrl}" style="background-color: #334155; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Return to SkyFlow →</a>
                </div>
            </body>
            </html>
        `);
    }
}

async function getProfile(req, res, next) {
    try {
        const token = req.headers['x-access-token'];
        const userProfile = await UserService.getProfile(token);
        SuccessResponse.data = userProfile;
        SuccessResponse.message = 'Successfully fetched user profile';
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch(error) {
        next(error);
    }
}

async function updateProfile(req, res, next) {
    try {
        const token = req.headers['x-access-token'];
        const userProfile = await UserService.updateProfile(token, req.body);
        SuccessResponse.data = userProfile;
        SuccessResponse.message = 'Successfully updated user profile';
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch(error) {
        next(error);
    }
}

async function forgotPassword(req, res, next) {
    try {
        await UserService.forgotPassword(req.body.email);
        SuccessResponse.data = {};
        SuccessResponse.message = 'Successfully sent password reset link to registered email';
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch(error) {
        next(error);
    }
}

async function resetPassword(req, res, next) {
    try {
        await UserService.resetPassword(req.body.token, req.body.password);
        SuccessResponse.data = {};
        SuccessResponse.message = 'Successfully updated the password';
        return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch(error) {
        next(error);
    }
}

async function testEmail(req, res) {
    const { sendVerificationEmail } = require('../utils/mailer');
    const targetEmail = req.query.email || 'aradhya.gargag89@gmail.com';
    try {
        await sendVerificationEmail(targetEmail, 'test-debug-token-123');
        return res.status(200).json({
            success: true,
            message: `Email test completed successfully to ${targetEmail}`,
            env: {
                hasUser: !!process.env.SMTP_USER,
                hasPass: !!process.env.SMTP_PASS,
                user: process.env.SMTP_USER
            }
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Email test failed',
            error: err.message,
            stack: err.stack,
            env: {
                hasUser: !!process.env.SMTP_USER,
                hasPass: !!process.env.SMTP_PASS,
                user: process.env.SMTP_USER
            }
        });
    }
}

module.exports = {
    signup,
    signin,
    isAuthenticated,
    verifyEmail,
    getProfile,
    updateProfile,
    forgotPassword,
    resetPassword,
    testEmail
};
