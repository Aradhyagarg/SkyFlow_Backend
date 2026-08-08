class AppError extends Error {
    constructor(message, statusCode) {
        super(Array.isArray(message) ? message.join(', ') : message);
        this.statusCode = statusCode;
        this.explanation = message;
    }
}

module.exports = AppError;