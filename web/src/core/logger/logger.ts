import winston from 'winston';

import { getLogLevel, prettyLogFormat } from '../../../../shared/src/util/logger/logger';

import { LogApiTransport } from './log-api-transport';


const logger = winston.createLogger({
    level: getLogLevel(),
    transports: [
        new winston.transports.Console({
            format: prettyLogFormat,
        }),
        new LogApiTransport(),
    ]
});

export default logger;