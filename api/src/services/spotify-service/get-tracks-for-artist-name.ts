import logger from '../../core/logger/logger';

import spotifyCacheService from '../cache/spotify/spotify-cache-service';

import doAndWaitForRateLimit from './do-and-wait-for-rate-limit';
import initSpotifyApi from './init-spotify-api';


async function getTracksForArtistName(artistName: string, accessToken: string) {
    logger.debug(`>>>> Entering getTracksForArtistName(artistName = ${artistName}`);

    const spotifyApi = await initSpotifyApi(accessToken);

    const artist = await doAndWaitForRateLimit(async () => {
        const searchResponse = await spotifyApi.searchArtists(artistName);
        const result = searchResponse.body.artists?.items[0];
        return result;
    });

    if (!artist) {
        return [];
    }

    const result = await spotifyCacheService.getTracksForArtist(artist.id, accessToken);
    return result;
}

export default getTracksForArtistName;
