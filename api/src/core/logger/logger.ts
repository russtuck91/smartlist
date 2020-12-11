import winston from 'winston';

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : undefined,
    transports: [
        new winston.transports.Console(),
    ]
});

export default logger;