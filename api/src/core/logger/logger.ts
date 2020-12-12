import winston from 'winston';

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : undefined,
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss ZZ' }),
        winston.format.align(),
        winston.format.printf((info) => {
            const { timestamp, level, message, ...args } = info;
            return `${timestamp} [${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
        }),
    ),
    transports: [
        new winston.transports.Console(),
    ]
});

export default logger;