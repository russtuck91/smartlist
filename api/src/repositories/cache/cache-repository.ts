import { CollectionProps, DBSource, MongoRepository } from 'mongtype';

import logger from '../../core/logger/logger';
import { CacheableResource, SavedCacheRecord } from '../../core/shared-models';


class CacheRepository<Resource extends CacheableResource> extends MongoRepository<SavedCacheRecord<Resource>> {
    constructor(dbSource: DBSource, opts?: CollectionProps) {
        super(dbSource, opts);
        this.ensureIndexes();
    }

    private async ensureIndexes() {
        const collection = await this.collection;
        await collection?.createIndex('item.id');
    }

    async insertManyResources(resources: Resource[]) {
        logger.info(`>>>> Entering CacheRepository.insertManyResources(resources.length = ${resources.length}`);
        const cacheRecords = this.createCacheRecordsFromResources(resources);
        await this.insertMany(cacheRecords);
    }

    private async insertMany(items: SavedCacheRecord<Resource>[]) {
        const collection = await this.collection;

        const result = await collection.insertMany(items);
        return result;
    }

    async bulkUpdateResources(resources: Resource[]) {
        const cacheRecords = this.createCacheRecordsFromResources(resources);
        await this.bulkUpdate(cacheRecords);
    }

    private async bulkUpdate(cacheItems: SavedCacheRecord<Resource>[]) {
        const collection = await this.collection;

        const operations = cacheItems.map((cacheItem) => ({
            updateOne: {
                filter: { 'item.id': cacheItem.item.id },
                update: { $set: cacheItem },
                upsert: true,
            },
        }));
        const result = await collection.bulkWrite(operations, { ordered: true });
        return result;
    }

    private createCacheRecordsFromResources(resources: Resource[]) {
        const now = new Date();
        const cachedRecords: SavedCacheRecord<Resource>[] = resources.map((item) => ({
            item,
            lastFetched: now,
        }));
        return cachedRecords;
    }
}

export default CacheRepository;
