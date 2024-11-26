import moment from 'moment';

import logger from '../../core/logger/logger';
import { CacheableResource, SavedCacheRecord } from '../../core/shared-models';

import CacheRepository from '../../repositories/cache/cache-repository';

import { SourceMethod } from './types';


class DbCacheService<Resource extends CacheableResource> {
    repo: CacheRepository<Resource>;
    sourceMethod: SourceMethod<Resource>;

    constructor(repo: CacheRepository<Resource>, sourceMethod: SourceMethod<Resource>) {
        this.repo = repo;
        this.sourceMethod = sourceMethod;
    }

    getItems = async (ids: string[], accessToken: string|undefined): Promise<Resource[]> => {
        logger.debug('>>>> Entering DbCacheService.getItems()');

        // Look for resources in DB cache
        const retrievedFromDB = await this.repo.find({
            conditions: { 'item.id': { $in: ids } },
        });
        const resourceItemsFromDb = retrievedFromDB.map((record) => record.item);

        // donotawait - send stored items to check for revalidation - stale-while-revalidate
        setTimeout(() => this.revalidateCacheItems(retrievedFromDB, accessToken), 500);

        // Any IDs not present in retrieved items need to be fetched
        const idsToFetch: string[] = ids.filter((id) => !retrievedFromDB.some((result) => result.item.id === id));
        if (idsToFetch.length === 0) {
            // No fetching needed, return and exit
            logger.debug('<<<< Exiting DbCacheService.getItems() after all items found in DB cache');
            return resourceItemsFromDb;
        }

        // Fetch remaining IDs from source method
        const fetchedItems: Resource[] = await this.sourceMethod(idsToFetch, accessToken);

        // donotawait - send new fetched items to DB cache
        this.repo.insertManyResources(fetchedItems);

        logger.debug(`<<<< Exiting DbCacheService.getItems() after fetching ${fetchedItems.length} items`);
        return [ ...resourceItemsFromDb, ...fetchedItems ];
    };

    private async revalidateCacheItems(cacheItems: SavedCacheRecord<Resource>[], accessToken: string|undefined) {
        try {
            logger.debug('>>>> Entering DbCacheService.revalidateCacheItems()');

            const needsUpdate = cacheItems.filter((cacheItem: SavedCacheRecord<Resource>) => {
                const now = moment();
                const daysAgo = now.diff(moment(cacheItem.lastFetched), 'days');
                return daysAgo > 90;
            });
            if (needsUpdate.length === 0) {
                // No updates needed, exit
                logger.debug('<<<< Exiting DbCacheService.revalidateCacheItems() because no updates to resources needed');
                return;
            }

            // Fetch items from source method
            const needsUpdateIds = needsUpdate.map((cacheItem) => cacheItem.item.id);
            const fetchedItems: Resource[] = await this.sourceMethod(needsUpdateIds, accessToken);

            // Send refreshed items to DB cache
            await this.repo.bulkUpdateResources(fetchedItems);
            logger.debug(`<<<< Exiting DbCacheService.revalidateCacheItems() after updating ${fetchedItems.length} items`);
        } catch (e) {
            logger.info('Error in DbCacheService.revalidateCacheItems');
            logger.error(e);
            logger.info(JSON.stringify(e));
        }
    }

    setItems = async (items: Resource[]) => {
        logger.debug('>>>> Entering DbCacheService.setItems()');
        await this.repo.bulkUpdateResources(items);
        logger.debug(`<<<< Exiting DbCacheService.setItems after setting ${items.length} items`);
    };
}

export default DbCacheService;
