import { sleep } from '../../../../shared';

import logger from '../../core/logger/logger';


async function doAndWaitForRateLimit(bodyFn: () => Promise<any>) {
    logger.debug('>>>> Entering doAndWaitForRateLimit()');
    try {
        return await bodyFn();
    } catch (e) {
        if (e.statusCode === 429) {
            logger.info('doAndWaitForRateLimit: Rate limit error occurred, will wait and try again');
            const retryAfterSec = e.headers && e.headers['retry-after'] ? parseInt(e.headers['retry-after']) : 3;
            // wait x seconds
            await sleep(retryAfterSec * 1000);

            // run bodyFn again
            return await doAndWaitForRateLimit(bodyFn);
        }

        logger.debug(`doAndWaitForRateLimit error: ${e.statusCode} ${e.body.error?.message}`);
        throw e;
    }
}

export default doAndWaitForRateLimit;
