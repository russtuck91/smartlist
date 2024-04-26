import logger from '../../core/logger/logger';
import maskToken from '../../core/logger/mask-token';

import spotifyCacheService from '../cache/spotify/spotify-cache-service';

import getUserById from './get-user-by-id';

async function fetchResourcesForUser(userId: string) {
    logger.info(`>>>> Entering fetchResourcesForUser(userId = ${userId}`);

    const user = await getUserById(userId);
    const { accessToken } = user;

    logger.info(`fetchResourcesForUser, user = ${userId} /// token = ${maskToken(accessToken)}`);
    const tracks = await spotifyCacheService.getFullMySavedTracks(accessToken);

    const albumIds: string[] = [];
    const artistIds: string[] = [];
    tracks.map((track) => {
        albumIds.push(track.albumId);
        track.artistIds.map((aId) => {
            artistIds.push(aId);
        });
    });

    await spotifyCacheService.getAlbums(albumIds, accessToken);
    await spotifyCacheService.getArtists(artistIds, accessToken);

    logger.info(`<<<< Exiting fetchResourcesForUser after successful fetch. userId = ${userId} /// token = ${maskToken(accessToken)}`);
}

export default fetchResourcesForUser;
