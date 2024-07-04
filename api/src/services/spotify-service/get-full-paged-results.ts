import { cloneDeep } from 'lodash';

import logger from '../../core/logger/logger';

import { isSpotifyError } from './types';


interface SpPaginationOptions {
    offset?: number;
    limit?: number;
}

type PagedResultsSourceMethod<T> = (options: SpPaginationOptions) => Promise<SpotifyApi.PagingObject<T>|undefined>

const defaultPagingObject = {
    href: '',
    items: [],
    limit: 0,
    next: '',
    offset: 0,
    previous: '',
    total: -1,
};

async function getFullPagedResults<T = any>(fn: PagedResultsSourceMethod<T>, maxPages?: number) {
    logger.debug('>>>> Entering getFullPagedResults()');
    let result: SpotifyApi.PagingObject<T> = defaultPagingObject;
    let offset = 0;
    const batchSize = 50;

    // while pages fetched is less than total reported, send request
    while (
        (!maxPages || (offset / batchSize) < maxPages) &&
        (result.total === -1 || (offset / batchSize) < Math.ceil(result.total / batchSize))
    ) {
        try {
            // logger.debug(`getFullPagedResults iteration #${(offset / batchSize) + 1} out of total ${result.total === -1 ? 'unknown' : Math.ceil(result.total / batchSize)}`);
            const options = { limit: batchSize, offset: offset };
            const response = await fn(options);

            if (!response) {
                logger.debug('getFullPagedResults exiting because of lack of response from callback fn. Check callback fn.');
                return result;
            }

            if (result.total === -1) {
                result = cloneDeep(response);
            } else {
                // take list from response and add it to result
                result.items.push(...response.items);
            }

            offset += batchSize;

            /**
             * `result.total` is not reliable- Spotify sometimes reports a total being higher than the actual results
             * If any iteration stops producing results and items.length === 0, stop there
             */
            if (response.items.length === 0) {
                logger.info(`getFullPagedResults is forcibly correcting the total param after getting no results and earlier checks did not catch. Original total was ${result.total} and will now be set to ${result.items.length}`);
                result.total = result.items.length;
            }
        } catch (e) {
            if (isSpotifyError(e)) {
                if (e.statusCode === 404) {
                    logger.debug('getFullPagedResults iteration received 404 error, exiting');
                    return result;
                }
                logger.debug(`getFullPagedResults iteration error: ${e.statusCode} ${e.body.error?.message}`);
            } else {
                logger.debug(e);
            }
            throw e;
        }
    }
    // result.total = result.items.length;

    logger.debug(`<<<< Exiting getFullPagedResults after fetching ${offset / batchSize} pages`);
    return result;
}

export default getFullPagedResults;
