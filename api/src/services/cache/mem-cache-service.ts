import logger from '../../core/logger/logger';
import { CacheableResource } from '../../core/shared-models';

import { SourceMethod } from './types';


class MemCacheService<Resource extends CacheableResource> {
    private store: Record<string, Resource> = {};
    private sourceMethod: SourceMethod<Resource>;
    setItems?: (items: Resource[]) => Promise<void>;

    constructor(sourceMethod: SourceMethod<Resource>) {
        this.sourceMethod = sourceMethod;
    }

    getItems = async (ids: string[], accessToken: string|undefined): Promise<Resource[]> => {
        logger.debug('>>>> Entering MemCacheService.getItems()');

        // Any IDs not found in memory need to be fetched
        const idsToFetch = ids.filter((id) => !this.store[id]);
        logger.debug(`# items requested: ${ids.length}`);
        logger.debug(`# items not found in memory, will be fetched: ${idsToFetch.length}`);

        if (idsToFetch.length > 0) {
            // Fetch remaining IDs from source method
            const fetchedItems = await this.sourceMethod(idsToFetch, accessToken);

            // Save to memory cache
            fetchedItems.reduce((agg, item) => {
                agg[item.id] = item;
                return agg;
            }, this.store);
        }

        const result = ids.map((id) => this.store[id]);

        logger.debug('<<<< Exiting MemCacheService.getItems()');
        return result;
    }
}

export default MemCacheService;
