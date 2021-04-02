import { chunk, truncate } from 'lodash';

import logger from '../../core/logger/logger';

import doAndWaitForRateLimit from './do-and-wait-for-rate-limit';
import initSpotifyApi from './init-spotify-api';


async function getArtists(artistIds: string[], accessToken: string|undefined): Promise<SpotifyApi.ArtistObjectFull[]> {
    logger.debug(`>>>> Entering getArtists(artistIds = ${truncate(artistIds.join(','))}`);

    const spotifyApi = await initSpotifyApi(accessToken);

    // Spotify API requires batches of 50 max
    const batchSize = 50;
    const batchedIds = chunk(artistIds, batchSize);

    let artists: SpotifyApi.ArtistObjectFull[] = [];
    for (const batch of batchedIds) {
        await doAndWaitForRateLimit(async () => {
            const artistResponse = await spotifyApi.getArtists(batch);
            artists = artists.concat(artistResponse.body.artists);
        });
    }

    return artists;
}

export default getArtists;
