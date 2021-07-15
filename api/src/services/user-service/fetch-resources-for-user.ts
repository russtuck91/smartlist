import logger from '../../core/logger/logger';

import spotifyCacheService from '../cache/spotify/spotify-cache-service';
import spotifyService from '../spotify-service/spotify-service';

import getUserById from './get-user-by-id';

async function fetchResourcesForUser(userId: string) {
    logger.debug(`>>>> Entering fetchResourcesForUser(userId = ${userId}`);

    const user = await getUserById(userId);
    const { accessToken } = user;

    const tracks = await spotifyService.getFullMySavedTracks(accessToken);

    const albumIds: string[] = [];
    const artistIds: string[] = [];
    tracks.map((track) => {
        albumIds.push(track.album.id);
        track.artists.map((artist) => {
            artistIds.push(artist.id);
        });
    });

    await spotifyCacheService.getAlbums(albumIds, accessToken);
    await spotifyCacheService.getArtists(artistIds, accessToken);
}

export default fetchResourcesForUser;
