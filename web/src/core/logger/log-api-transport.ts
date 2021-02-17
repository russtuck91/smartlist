import Transport from 'winston-transport';

import logToPersistent from './log-to-persistent';

export class LogApiTransport extends Transport {
    log(info, callback) {
        // console.log(`>>> Entering LogApiTransport.log(info.level = ${info.level}, info.message = ${info.message}`);
        logToPersistent(info);
        callback();
    }
}
