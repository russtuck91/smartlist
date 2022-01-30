import logger from '../../core/logger/logger';

interface SpPaginationOptions {
    offset?: number;
    limit?: number;
}

type PagedResultsSourceMethod = (options: SpPaginationOptions) => Promise<SpotifyApi.PagingObject<any>|undefined>

async function getFullPagedResults(fn: PagedResultsSourceMethod, maxPages?: number) {
    logger.debug('>>>> Entering getFullPagedResults()');
    let result: SpotifyApi.PagingObject<any>|undefined;
    let offset = 0;
    const batchSize = 50;

    // while number fetched is less than total reported, send request
    while (
        (!maxPages || (offset / batchSize) < maxPages) &&
        (!result || result.total > result.items.length)
    ) {
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
            if (e.statusCode === 404) {
                logger.debug('getFullPagedResults iteration received 404 error, exiting');
                return result;
            }
            logger.debug(`getFullPagedResults iteration error: ${e.statusCode} ${e.body.error?.message}`);
            throw e;
        }
    }

    logger.debug(`<<<< Exiting getFullPagedResults after fetching ${offset / batchSize} pages`);
    return result;
}

export default getFullPagedResults;
