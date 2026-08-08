const express = require('express');
const { UserController } = require('../../controllers');
const { AuthRequestMiddlewares } = require('../../middlewares');

const router = express.Router();

router.post('/signup', AuthRequestMiddlewares.validateAuthRequest, UserController.signup);
router.post('/signin', AuthRequestMiddlewares.validateAuthRequest, UserController.signin);
router.get('/authenticate', UserController.isAuthenticated);
router.get('/verify', UserController.verifyEmail);
router.get('/profile', UserController.getProfile);
router.patch('/profile', UserController.updateProfile);
router.post('/forgot-password', UserController.forgotPassword);
router.post('/reset-password', UserController.resetPassword);

module.exports = router;
