import _ from 'lodash';

import logger from '../../core/logger/logger';

import ChronoCacheRepository from '../../repositories/cache/chrono-cache-repository';

import { getUserByAccessToken } from '../user-service';


type ChronoSourceMethod = (accessToken: string|undefined, maxPages?: number) => Promise<SpotifyApi.SavedTrackObject[]>;

class ChronoDbCacheService {
    repo: ChronoCacheRepository;
    sourceMethod: ChronoSourceMethod;

    constructor(repo: ChronoCacheRepository, sourceMethod: ChronoSourceMethod) {
        this.repo = repo;
        this.sourceMethod = sourceMethod;
    }

    getFullList = async (accessToken: string): Promise<SpotifyApi.TrackObjectFull[]> => {
        logger.debug('>>>> Entering ChronoDbCacheService.getFullList()');

        // Get user id from access token
        const user = await getUserByAccessToken(accessToken);
        const userId = user?.id;
        logger.debug(`Found user of userId: ${userId}`);

        // FEATURE FLAG: useNewCacheFeature
        // This block should be removed when feature is ready. Also move user block back down below freshFirstPage.length === 0
        if (!user || !user.useNewCacheFeature) {
            const freshResults = await this.sourceMethod(accessToken);
            logger.debug('<<<< Exiting ChronoDbCacheService.getFullList() after user does not have feature enabled and fetching fresh list');
            return freshResults.map((i) => i.track);
        }
        // END FEATURE FLAG

        // Get first page from sourceMethod
        const freshFirstPage = await this.sourceMethod(accessToken, 1);
        if (freshFirstPage.length === 0) {
            logger.debug('<<<< Exiting ChronoDbCacheService.getFullList() after fresh list had no entries');
            return freshFirstPage.map((i) => i.track);
        }

        // Get cached list from DB
        const cachedList = await this.repo.findOne({
            userId: userId,
        });
        logger.debug(`Found cachedList of length ${cachedList?.tracks.length}`);

        // Truncate cachedList to same as freshFirstPage and compare
        const truncatedCachedList = cachedList?.tracks.slice(0, freshFirstPage.length);
        logger.debug(`Truncated cache list is ${truncatedCachedList?.length} items big, and fresh first page is ${freshFirstPage.length} items big`);
        const isCachedEqual = _.isEqual(freshFirstPage, truncatedCachedList);
        logger.debug(`Determined if the cache list is valid: ${!!cachedList && isCachedEqual}`);
        if (cachedList && isCachedEqual) {
            // If equal, cachedList is valid, return it
            logger.debug('<<<< Exiting ChronoDbCacheService.getFullList() after valid list found in cache');
            return cachedList.tracks.map((i) => i.track);
        } else {
            // Else, get full results from sourceMethod
            const freshResults = await this.sourceMethod(accessToken);

            // donotawait - save new results to cache
            if (userId) {
                this.repo.updateTracksForUserId(userId, freshResults);
            }

            logger.debug('<<<< Exiting ChronoDbCacheService.getFullList() after fetching fresh list');
            return freshResults.map((i) => i.track);
        }
    }
}

export default ChronoDbCacheService;
