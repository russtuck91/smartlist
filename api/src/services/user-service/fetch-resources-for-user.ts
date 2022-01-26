import logger from '../../core/logger/logger';

import spotifyCacheService from '../cache/spotify/spotify-cache-service';

import getUserById from './get-user-by-id';

async function fetchResourcesForUser(userId: string) {
    logger.debug(`>>>> Entering fetchResourcesForUser(userId = ${userId}`);

    const user = await getUserById(userId);
    const { accessToken } = user;

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
}

export default fetchResourcesForUser;
