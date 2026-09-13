const express = require('express');
const userRouter = require('./user');

const router = express.Router();

router.get('/info', (req, res) => {
    console.log(`[Keep-Alive] Auth-Service health ping received at ${new Date().toISOString()}`);
    return res.status(200).json({
        success: true,
        message: 'Auth Service is live',
        error: {},
        data: {}
    });
});

router.use('/users', userRouter);

module.exports = router;
