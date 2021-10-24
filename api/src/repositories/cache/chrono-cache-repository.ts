import { MongoRepository } from 'mongtype';

import { ChronoCacheRecord } from '../../core/shared-models';


class ChronoCacheRepository extends MongoRepository<ChronoCacheRecord> {
    async updateTracksForUserId(userId: string, tracks: SpotifyApi.SavedTrackObject[]) {
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
