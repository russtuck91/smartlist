import moment from 'moment';

import logger from '../../core/logger/logger';
import { CacheableResource, SavedCacheRecord } from '../../core/shared-models';

import CacheRepository from '../../repositories/cache/cache-repository';

import { SourceMethod } from './types';


const REVALIDATE_DAYS = 14;
const EVICT_DAYS = 60;

class DbCacheService<Resource extends CacheableResource> {
    repo: CacheRepository<Resource>;
    sourceMethod: SourceMethod<Resource>;

    constructor(repo: CacheRepository<Resource>, sourceMethod: SourceMethod<Resource>) {
        this.repo = repo;
        this.sourceMethod = sourceMethod;
    }

    getItems = async (ids: string[], accessToken: string|undefined): Promise<Resource[]> => {
        logger.debug(`>>>> Entering DbCacheService.getItems(repoName = ${this.repo.options.name}`);

        // Look for resources in DB cache
        const retrievedFromDB = await this.repo.find({
            conditions: { 'item.id': { $in: ids } },
        });
        const resourceItemsFromDb = retrievedFromDB.map((record) => record.item);

        // donotawait - send stored items to check for revalidation - stale-while-revalidate
        setTimeout(() => this.revalidateCacheItems(retrievedFromDB, accessToken), 500);

        // Any IDs not present in retrieved items need to be fetched
        const idsToFetch: string[] = ids.filter((id) => !retrievedFromDB.some((result) => result.item.id === id));
        const fetchedItems = await this.getItemsFromFetch(idsToFetch, accessToken);

        logger.debug(`<<<< Exiting DbCacheService.getItems() after getting ${resourceItemsFromDb.length} items from DB and ${fetchedItems.length} items from fetch`);
        setTimeout(() => this.pruneCache(), 3000);
        return [ ...resourceItemsFromDb, ...fetchedItems ];
    };

    private async getItemsFromFetch(idsToFetch: string[], accessToken: string|undefined) {
        if (idsToFetch.length === 0) {
            // No fetching needed, return and exit
            logger.debug('All items found in DB cache, fetch not needed');
            return [];
        }

        // Fetch remaining IDs from source method
        const fetchedItems: Resource[] = await this.sourceMethod(idsToFetch, accessToken);

        // donotawait - send new fetched items to DB cache
        this.repo.insertManyResources(fetchedItems);

        logger.debug(`Fetched ${fetchedItems.length} items`);
        return fetchedItems;
    }

    private async revalidateCacheItems(cacheItems: SavedCacheRecord<Resource>[], accessToken: string|undefined) {
        try {
            logger.debug('>>>> Entering DbCacheService.revalidateCacheItems()');

            const now = moment();
            const needsUpdate = cacheItems.filter((cacheItem: SavedCacheRecord<Resource>) => {
                const daysAgo = now.diff(moment(cacheItem.lastFetched), 'days');
                return daysAgo > REVALIDATE_DAYS;
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

    /**
     * Prune unnecessary records from DB, run in the background
     */
    private async pruneCache() {
        logger.debug('>>>> Entering DbCacheService.pruneCache()');
        try {
            const cutoffDate = moment().subtract(EVICT_DAYS, 'days').toDate();
            const result = await this.repo.deleteMany({
                lastFetched: { $lt: cutoffDate },
            });
            logger.debug(`Pruned ${result.deletedCount} expired cache items`);
        } catch (e) {
            logger.error('Error during cache pruning');
            console.error(e);
        }
    }

    setItems = async (items: Resource[]) => {
        logger.debug('>>>> Entering DbCacheService.setItems()');
        await this.repo.bulkUpdateResources(items);
        logger.debug(`<<<< Exiting DbCacheService.setItems after setting ${items.length} items`);
    };
}

export default DbCacheService;
