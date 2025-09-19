import { FilterQuery } from 'mongodb';
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
        try {
            logger.info(`>>>> Entering CacheRepository.insertManyResources(resources.length = ${resources.length}`);
            if (!resources.length) return;
            const cacheRecords = this.createCacheRecordsFromResources(resources);
            await this.insertMany(cacheRecords);
        } catch (e) {
            logger.info('Error in CacheRepository.insertManyResources');
            logger.error(e);
        }
    }

    private async insertMany(items: SavedCacheRecord<Resource>[]) {
        const collection = await this.collection;

        const result = await collection.insertMany(items);
        return result;
    }

    async bulkUpdateResources(resources: Resource[]) {
        logger.info(`>>>> Entering CacheRepository.bulkUpdateResources(resources.length = ${resources.length}`);
        if (!resources.length) return;
        // Temp for debugging
        if (resources.length === 1) {
            logger.info(resources[0]);
            logger.info(JSON.stringify(resources[0]));
        }
        const cacheRecords = this.createCacheRecordsFromResources(resources);
        await this.bulkUpdate(cacheRecords);
    }

    private async bulkUpdate(cacheItems: SavedCacheRecord<Resource>[]) {
        const collection = await this.collection;

        const operations = cacheItems.map((cacheItem) => ({
            updateOne: {
                filter: { 'item.id': cacheItem.item.id },
                update: {
                    $set: {
                        item: cacheItem.item,
                        lastFetched: cacheItem.lastFetched,
                    },
                },
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
            usageCount: 1,
        }));
        return cachedRecords;
    }

    async deleteMany(conditions: FilterQuery<SavedCacheRecord<Resource>>) {
        const collection = await this.collection;

        return await collection.deleteMany(conditions);
    }

    async countDocuments() {
        const collection = await this.collection;
        return await collection.countDocuments();
    }

    async incrementUsageCounts(ids: string[]) {
        if (!ids.length) return;
        const collection = await this.collection;
        await collection.updateMany(
            { 'item.id': { $in: ids } },
            { $inc: { usageCount: 1 } },
        );
    }
}

export default CacheRepository;
