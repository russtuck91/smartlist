import logger from '../../core/logger/logger';
import { CacheableResource } from '../../core/shared-models';

import { SourceMethod } from './types';


class MemCacheService<Resource extends CacheableResource> {
    private store: Map<string, Resource> = new Map();
    private sourceMethod: SourceMethod<Resource>;
    private maxSize: number;
    setItems?: (items: Resource[]) => Promise<void>;

    constructor(sourceMethod: SourceMethod<Resource>, maxSize: number = 100_000) {
        this.sourceMethod = sourceMethod;
        this.maxSize = maxSize;
    }

    getItems = async (ids: string[], accessToken: string|undefined): Promise<Resource[]> => {
        logger.debug('>>>> Entering MemCacheService.getItems()');

        // Any IDs not found in memory need to be fetched
        const idsToFetch = ids.filter((id) => !this.store.has(id));
        logger.debug(`Total requested: ${ids.length} /// Not in memory, will be fetched: ${idsToFetch.length}`);

        if (idsToFetch.length > 0) {
            // Fetch remaining IDs from source method
            const fetchedItems = await this.sourceMethod(idsToFetch, accessToken);

            // Save to memory cache
            for (const item of fetchedItems) {
                this.set(item.id, item);
            }
        }

        // Update usage order for all requested IDs (even if already present)
        ids.forEach((id) => {
            if (this.store.has(id)) {
                const value = this.store.get(id)!;
                this.store.delete(id);
                this.store.set(id, value);
            }
        });

        const result = ids.map((id) => this.store.get(id)!);

        logger.debug(`MemCacheService store size: ${this.store.size}`);
        logger.debug('<<<< Exiting MemCacheService.getItems()');
        return result;
    };

    /**
     * Set an item in the cache, evicting LRU if necessary
     */
    private set(key: string, value: Resource) {
        if (this.store.has(key)) {
            this.store.delete(key);
        }
        this.store.set(key, value);

        // LRU - Evict least recently used if over max size
        if (this.store.size > this.maxSize) {
            const lruKey = this.store.keys().next().value;
            this.store.delete(lruKey);
            logger.debug(`MemCacheService - Evicted LRU cache key: ${lruKey}`);
        }
    }
}

export default MemCacheService;
