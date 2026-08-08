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
    try {
        await UserService.verifyEmail(req.query.token);
        return res.status(StatusCodes.OK).send(`
            <div style="font-family: sans-serif; text-align: center; margin-top: 100px; padding: 20px;">
                <h1 style="color: #34d399; font-size: 2.2rem; font-weight: 800; margin-bottom: 20px;">✓ Email Verified Successfully!</h1>
                <p style="font-size: 1.1rem; color: #cbd5e1; background: #1e293b; padding: 15px; border-radius: 8px; max-width: 400px; margin: 0 auto 20px auto; border: 1px solid #334155;">Your MakeMyTrip account is now active.</p>
                <p style="color: #94a3b8; font-size: 0.95rem;">You can now close this tab and sign in to the application.</p>
            </div>
        `);
    } catch(error) {
        return res.status(StatusCodes.BAD_REQUEST).send(`
            <div style="font-family: sans-serif; text-align: center; margin-top: 100px; padding: 20px;">
                <h1 style="color: #f43f5e; font-size: 2.2rem; font-weight: 800; margin-bottom: 20px;">❌ Verification Failed</h1>
                <p style="font-size: 1.1rem; color: #cbd5e1; background: #1e293b; padding: 15px; border-radius: 8px; max-width: 400px; margin: 0 auto 20px auto; border: 1px solid #334155;">${error.message || 'Invalid or expired verification link.'}</p>
                <p style="color: #94a3b8; font-size: 0.95rem;">Please request a new link or try registering again.</p>
            </div>
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

module.exports = {
    signup,
    signin,
    isAuthenticated,
    verifyEmail,
    getProfile,
    updateProfile,
    forgotPassword,
    resetPassword
};
