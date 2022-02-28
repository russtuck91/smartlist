import _ from 'lodash';

import { Track } from '../../../../shared';

import logger from '../../core/logger/logger';
import { UserSavedTrackReference } from '../../core/shared-models';

import { mapToTrack, mapToUserSavedTrackReference } from '../../mappers/spotify/saved-track-object-mapper';
import ChronoCacheRepository from '../../repositories/cache/chrono-cache-repository';

import { getUserByAccessToken } from '../user-service';

import spotifyCacheService from './spotify/spotify-cache-service';


type ChronoSourceMethod = (accessToken: string|undefined, maxPages?: number) => Promise<SpotifyApi.SavedTrackObject[]>;

class ChronoDbCacheService {
    repo: ChronoCacheRepository;
    sourceMethod: ChronoSourceMethod;

    constructor(repo: ChronoCacheRepository, sourceMethod: ChronoSourceMethod) {
        this.repo = repo;
        this.sourceMethod = sourceMethod;
    }

    getFullList = async (accessToken: string): Promise<Track[]> => {
        logger.debug('>>>> Entering ChronoDbCacheService.getFullList()');

        // Get user id from access token
        const user = await getUserByAccessToken(accessToken);

        // FEATURE FLAG: suppressNewCacheFeature
        // This block should be removed when feature is ready. Also move user block back down below freshFirstPage.length === 0
        if (!user || user.suppressNewCacheFeature) {
            const freshResults = await this.sourceMethod(accessToken);
            logger.debug('<<<< Exiting ChronoDbCacheService.getFullList() after user does not have feature enabled and fetching fresh list');
            return freshResults.map(mapToTrack);
        }
        // END FEATURE FLAG

        // Get first page from sourceMethod
        const freshFirstPage = await this.sourceMethod(accessToken, 1);
        if (freshFirstPage.length === 0) {
            logger.debug('<<<< Exiting ChronoDbCacheService.getFullList() after fresh list had no entries');
            return freshFirstPage.map(mapToTrack);
        }

        // Get cached list from DB
        const userId = user.id;
        const cachedList = await this.repo.findOne({
            userId: userId,
        });

        if (cachedList) {
            // Truncate cachedList to same as freshFirstPage and compare
            const truncatedCachedList = cachedList.tracks.slice(0, freshFirstPage.length);
            const freshFirstPageIds: UserSavedTrackReference[] = freshFirstPage.map(mapToUserSavedTrackReference);
            const isCachedEqual = _.isEqual(freshFirstPageIds, truncatedCachedList);
            if (isCachedEqual) {
                // If equal, cachedList is valid, return it
                const cachedListIds = cachedList.tracks.map((i) => i.trackId);
                const tracksResult = await spotifyCacheService.getTracks(cachedListIds, accessToken);
                logger.debug('<<<< Exiting ChronoDbCacheService.getFullList() after valid list found in cache');
                return tracksResult;
            }
        }

        // Else, get full results from sourceMethod
        const freshResults = await this.sourceMethod(accessToken);

        // donotawait - save new results to cache
        this.storeFreshResultsInCache(userId, freshResults);

        logger.debug('<<<< Exiting ChronoDbCacheService.getFullList() after fetching fresh list');
        return freshResults.map(mapToTrack);
    };

    private async storeFreshResultsInCache(userId: string, freshResults: SpotifyApi.SavedTrackObject[]) {
        const freshUserSavedTrackRef: UserSavedTrackReference[] = freshResults.map(mapToUserSavedTrackReference);
        this.repo.updateTracksForUserId(userId, freshUserSavedTrackRef);

        spotifyCacheService.setTracks(freshResults.map(mapToTrack));
    }
}

export default ChronoDbCacheService;
