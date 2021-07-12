import winston from 'winston';

export function getLogLevel() {
    console.log('>>>> Entering getLogLevel()');
    if (process.env.LOG_LEVEL) {
        console.log('env LOG_LEVEL:', process.env.LOG_LEVEL);
        return process.env.LOG_LEVEL;
    }
    if (process.env.NODE_ENV === 'development') {
        console.log('env NODE_ENV==development, setting level to debug');
        return 'debug';
    }
    console.log('No log level condition met, using default level');
    return undefined;
}

export const prettyLogFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS ZZ' }),
    winston.format.align(),
    winston.format.printf((info) => {
        const { timestamp, level, message, ...args } = info;
        return `${timestamp} [${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
    }),
);

