import logger from '../../core/logger/logger';

interface SpPaginationOptions {
    offset?: number;
    limit?: number;
}

async function getFullPagedResults(fn: (options: SpPaginationOptions) => Promise<SpotifyApi.PagingObject<any>|undefined>) {
    logger.debug('>>>> Entering getFullPagedResults()');
    let result: SpotifyApi.PagingObject<any>|undefined;
    let offset = 0;
    const batchSize = 50;

    // while number fetched is less than total reported, send request
    while (!result || result.total > result.items.length) {
        try {
            const options = { limit: batchSize, offset: offset };
            const response = await fn(options);

            if (!response) {
                logger.debug('getFullPagedResults exiting because of lack of response from callback fn. Check callback fn.');
                return;
            }

            if (!result) {
                result = response;
            } else {
                // take list from response and add it to result
                result.items.push(...response.items);
            }

            offset += batchSize;
        } catch (e) {
            logger.debug('error in getFullPagedResults iteration', e.statusCode);
            if (e.statusCode === 404) {
                logger.debug('404 error, exiting');
                return result;
            }
            logger.debug(`${e.statusCode} ${e.body.error?.message}`);
            throw e;
        }
    }

    logger.debug(`<<<< Exiting getFullPagedResults after fetching ${offset / batchSize} pages`);
    return result;
}

export default getFullPagedResults;
