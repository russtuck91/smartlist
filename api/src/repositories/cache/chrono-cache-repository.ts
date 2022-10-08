import { CollectionProps, DBSource, MongoRepository } from 'mongtype';

import { ChronoCacheRecord } from '../../core/shared-models';


class ChronoCacheRepository extends MongoRepository<ChronoCacheRecord> {
    constructor(dbSource: DBSource, opts?: CollectionProps) {
        super(dbSource, opts);
        this.ensureIndexes();
    }

    private async ensureIndexes() {
        const collection = await this.collection;
        await collection?.createIndex('userId');
    }

    async updateTracksForUserId(userId: string, tracks: ChronoCacheRecord['tracks']) {
        await this.findOneAndUpdate({
            conditions: {
                userId: userId,
            },
            updates: {
                $set: {
                    tracks: tracks,
                },
            },
            upsert: true,
        });
    }
}

export default ChronoCacheRepository;
