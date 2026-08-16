const { UserRepository } = require('../repositories');
const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/errors/app-error');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { ServerConfig } = require('../config');
const { sendVerificationEmail } = require('../utils/mailer');

const userRepository = new UserRepository();

async function create(data) {
    try {
        const token = crypto.randomBytes(32).toString('hex');
        const userData = { ...data, verificationToken: token, isVerified: false };
        const user = await userRepository.create(userData);
        
        // Trigger email sending asynchronously
        sendVerificationEmail(user.email, token);
        
        return user;
    } catch(error) {
        if(error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            let explanation = [];
            error.errors.forEach((err) => {
                explanation.push(err.message);
            });
            throw new AppError(explanation, StatusCodes.BAD_REQUEST);
        }
        throw new AppError('Cannot create a new user object', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function signin(data) {
    try {
        const user = await userRepository.getUserByEmail(data.email);
        if(!user) {
            throw new AppError('No user found for the given email', StatusCodes.NOT_FOUND);
        }
        const passwordMatch = user.comparePassword(data.password);
        if(!passwordMatch) {
            throw new AppError('Invalid password', StatusCodes.BAD_REQUEST);
        }
        // TEMPORARILY DISABLED FOR TESTING
        // if(!user.isVerified) {
        //     throw new AppError('Please verify your email before logging in.', StatusCodes.BAD_REQUEST);
        // }
        const jwtToken = jwt.sign(
            { id: user.id, email: user.email },
            ServerConfig.JWT_SECRET,
            { expiresIn: ServerConfig.JWT_EXPIRY }
        );
        return jwtToken;
    } catch(error) {
        if(error instanceof AppError) throw error;
        throw new AppError('Something went wrong during signing in', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function isAuthenticated(token) {
    try {
        if(!token) {
            throw new AppError('Missing JWT token', StatusCodes.BAD_REQUEST);
        }
        const response = jwt.verify(token, ServerConfig.JWT_SECRET);
        const user = await userRepository.get(response.id);
        if(!user) {
            throw new AppError('User not found', StatusCodes.NOT_FOUND);
        }
        return user;
    } catch(error) {
        if(error instanceof AppError) throw error;
        if(error.name === 'JsonWebTokenError') {
            throw new AppError('Invalid JWT token', StatusCodes.BAD_REQUEST);
        }
        if(error.name === 'TokenExpiredError') {
            throw new AppError('JWT token expired', StatusCodes.BAD_REQUEST);
        }
        throw new AppError('Something went wrong during authentication', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function verifyEmail(token) {
    try {
        if (!token) {
            throw new AppError('Verification token is required', StatusCodes.BAD_REQUEST);
        }
        const user = await userRepository.getUserByVerificationToken(token);
        if (!user) {
            throw new AppError('Invalid or expired verification token', StatusCodes.BAD_REQUEST);
        }
        user.isVerified = true;
        user.verificationToken = null;
        await user.save();
        return user;
    } catch(error) {
        if(error instanceof AppError) throw error;
        throw new AppError('Something went wrong during email verification', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function getProfile(token) {
    try {
        const user = await isAuthenticated(token);
        return {
            id: user.id,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            fullName: user.fullName || '',
            phoneNumber: user.phoneNumber || '',
            passportNumber: user.passportNumber || '',
            nationality: user.nationality || '',
            createdAt: user.createdAt
        };
    } catch(error) {
        throw error;
    }
}

async function updateProfile(token, data) {
    try {
        const user = await isAuthenticated(token);
        user.fullName = data.fullName !== undefined ? data.fullName : user.fullName;
        user.phoneNumber = data.phoneNumber !== undefined ? data.phoneNumber : user.phoneNumber;
        user.passportNumber = data.passportNumber !== undefined ? data.passportNumber : user.passportNumber;
        user.nationality = data.nationality !== undefined ? data.nationality : user.nationality;
        await user.save();
        
        return {
            id: user.id,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            fullName: user.fullName || '',
            phoneNumber: user.phoneNumber || '',
            passportNumber: user.passportNumber || '',
            nationality: user.nationality || '',
            createdAt: user.createdAt
        };
    } catch(error) {
        throw error;
    }
}

async function forgotPassword(email) {
    try {
        if (!email) {
            throw new AppError('Email address is required', StatusCodes.BAD_REQUEST);
        }
        const user = await userRepository.getUserByEmail(email);
        if (!user) {
            throw new AppError('No user found for the given email', StatusCodes.NOT_FOUND);
        }

        // Generate token and expiration (15 minutes)
        const token = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
        await user.save();

        // Send Email
        const { sendResetPasswordEmail } = require('../utils/mailer');
        sendResetPasswordEmail(user.email, token);

        return true;
    } catch(error) {
        if (error instanceof AppError) throw error;
        throw new AppError('Something went wrong while generating reset token', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function resetPassword(token, newPassword) {
    try {
        if (!token) {
            throw new AppError('Reset token is required', StatusCodes.BAD_REQUEST);
        }
        if (!newPassword) {
            throw new AppError('New password is required', StatusCodes.BAD_REQUEST);
        }
        if (newPassword.length < 3 || newPassword.length > 50) {
            throw new AppError('Password length must be between 3 and 50 characters', StatusCodes.BAD_REQUEST);
        }

        const user = await userRepository.getUserByResetToken(token);
        if (!user) {
            throw new AppError('Invalid or expired reset token', StatusCodes.BAD_REQUEST);
        }

        // Check if token has expired
        const now = new Date();
        const expires = new Date(user.resetPasswordExpires);
        if (expires < now) {
            throw new AppError('Reset token has expired', StatusCodes.BAD_REQUEST);
        }

        // Update password and clear token
        user.password = newPassword; // beforeSave hook hashes this automatically
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        return true;
    } catch(error) {
        if (error instanceof AppError) throw error;
        if(error.name === 'SequelizeValidationError') {
            let explanation = [];
            error.errors.forEach((err) => {
                explanation.push(err.message);
            });
            throw new AppError(explanation, StatusCodes.BAD_REQUEST);
        }
        throw new AppError('Something went wrong while resetting password', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

module.exports = {
    create,
    signin,
    isAuthenticated,
    verifyEmail,
    getProfile,
    updateProfile,
    forgotPassword,
    resetPassword
};
