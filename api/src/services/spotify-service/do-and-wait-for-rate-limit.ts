import logger from '../../core/logger/logger';
import { sleep } from '../../core/utils/utils';

async function doAndWaitForRateLimit(bodyFn: () => Promise<any>) {
    logger.debug('>>>> Entering doAndWaitForRateLimit()');
    try {
        return await bodyFn();
    } catch (e) {
        logger.debug('error found in doAndWaitForRateLimit', e.statusCode);
        if (e.statusCode === 429) {
            logger.debug('Rate limit error occurred, will wait and try again');
            // e.headers not yet passed from spotify-web-api-node
            const retryAfterSec = e.headers && e.headers['retry-after'] ? parseInt(e.headers['retry-after']) : 3;
            // wait x seconds
            await sleep(retryAfterSec * 1000);

            // run bodyFn again
            return await bodyFn();
        }

        logger.debug(e);
        throw e;
    }
}

export default doAndWaitForRateLimit;
