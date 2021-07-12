import { MongoRepository } from 'mongtype';

import { CacheableResource, SavedCacheRecord } from '../../core/shared-models';


class CacheRepository<Resource extends CacheableResource> extends MongoRepository<SavedCacheRecord<Resource>> {
    async insertManyResources(resources: Resource[]) {
        const cacheRecords = this.createCacheRecordsFromResources(resources);
        await this.insertMany(cacheRecords);
    }

    async insertMany(items: SavedCacheRecord<Resource>[]) {
        const collection = await this.collection;

        const result = await collection.insertMany(items);
        return result;
    }

    async bulkUpdateResources(resources: Resource[]) {
        const cacheRecords = this.createCacheRecordsFromResources(resources);
        await this.bulkUpdate(cacheRecords);
    }

    async bulkUpdate(cacheItems: SavedCacheRecord<Resource>[]) {
        const collection = await this.collection;

        const operations = cacheItems.map((cacheItem) => ({
            updateOne: {
                filter: { 'item.id': cacheItem.item.id },
                update: { $set: cacheItem },
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
