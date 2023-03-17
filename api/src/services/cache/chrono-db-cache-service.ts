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

    private getFullListBase = async <T = any>(accessToken: string, {
        onReturnCachedList,
        onReturnFreshResults,
    }: {
        onReturnCachedList?: (cachedList: UserSavedTrackReference[]) => Promise<T[]>,
        onReturnFreshResults?: (freshResults: SpotifyApi.SavedTrackObject[]) => T[],
    } = {}): Promise<T[]> => {
        logger.debug('>>>> Entering ChronoDbCacheService.getFullList()');

        // Get first page from sourceMethod
        const freshFirstPage = await this.sourceMethod(accessToken, 1);
        if (freshFirstPage.length === 0) {
            logger.debug('<<<< Exiting ChronoDbCacheService.getFullList() after fresh list had no entries');
            return [];
        }

        // Get user id from access token
        const userId = (await getUserByAccessToken(accessToken))?.id;
        // Get cached list from DB
        const cachedList = await this.getCachedListIfValid(userId, freshFirstPage);
        if (cachedList) {
            logger.debug('<<<< Exiting ChronoDbCacheService.getFullList() after valid list found in cache');
            if (!onReturnCachedList) {
                return cachedList as any[];
            }
            return await onReturnCachedList(cachedList);
        }

        // Else, get full results from sourceMethod
        const freshResults = await this.sourceMethod(accessToken);

        // donotawait - save new results to cache
        this.storeFreshResultsInCache(userId!, freshResults);

        logger.debug('<<<< Exiting ChronoDbCacheService.getFullList() after fetching fresh list');
        if (!onReturnFreshResults) {
            return freshResults as any[];
        }
        return onReturnFreshResults(freshResults);
    };

    private getCachedListIfValid = async (userId: string|undefined, freshFirstPage: SpotifyApi.SavedTrackObject[]) => {
        const cachedList = await this.repo.findOne({
            userId: userId,
        });

        if (cachedList) {
            // Truncate cachedList to same length as freshFirstPage and compare
            const truncatedCachedList = cachedList.tracks.slice(0, freshFirstPage.length);
            const freshFirstPageIds: UserSavedTrackReference[] = freshFirstPage.map(mapToUserSavedTrackReference);
            const isCachedEqual = _.isEqual(freshFirstPageIds, truncatedCachedList);
            if (isCachedEqual) {
                // If equal, cachedList is valid, return it
                return cachedList.tracks;
            }
        }
    };

    private async storeFreshResultsInCache(userId: string, freshResults: SpotifyApi.SavedTrackObject[]) {
        const freshUserSavedTrackRef: UserSavedTrackReference[] = freshResults.map(mapToUserSavedTrackReference);
        this.repo.updateTracksForUserId(userId, freshUserSavedTrackRef);

        spotifyCacheService.setTracks(freshResults.map(mapToTrack));
    }

    getFullTrackList = async (accessToken: string): Promise<Track[]> => {
        return await this.getFullListBase<Track>(accessToken, {
            onReturnCachedList: async (cachedList) => {
                const cachedListIds = cachedList.map((i) => i.trackId);
                const tracksResult = await spotifyCacheService.getTracks(cachedListIds, accessToken);
                return tracksResult;
            },
            onReturnFreshResults: (freshResults) => freshResults.map(mapToTrack),
        });
    };

    getFullSavedTrackReference = async (accessToken: string): Promise<UserSavedTrackReference[]> => {
        return await this.getFullListBase<UserSavedTrackReference>(accessToken, {
            onReturnFreshResults: (freshResults) => freshResults.map(mapToUserSavedTrackReference),
        });
    };
}

export default ChronoDbCacheService;
