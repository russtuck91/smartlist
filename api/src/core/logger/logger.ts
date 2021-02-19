import winston from 'winston';

import { getLogLevel, prettyLogFormat } from '../../../../shared/src/util/logger/logger';

const logger = winston.createLogger({
    level: getLogLevel(),
    format: prettyLogFormat,
    transports: [
        new winston.transports.Console(),
    ],
});

export default logger;
