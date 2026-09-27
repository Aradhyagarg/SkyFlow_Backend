const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const customFormat = printf(( { level, message, timestamp, error } ) => {
    return `${timestamp} : ${level}: ${message}`;
});

const loggerTransports = [
    new transports.Console()
];

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    loggerTransports.push(new transports.File({filename: 'combined.log'}));
}

const logger = createLogger({
    format: combine(
        timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
        customFormat,
    ),
    transports: loggerTransports,
});

module.exports = logger;