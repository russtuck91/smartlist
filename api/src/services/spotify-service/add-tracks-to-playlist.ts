import { chunk } from 'lodash';

import logger from '../../core/logger/logger';

import doAndWaitForRateLimit from './do-and-wait-for-rate-limit';
import initSpotifyApi from './init-spotify-api';


async function addTracksToPlaylist(playlistId: string, trackUris: string[], accessToken: string|undefined) {
    logger.debug(`>>>> Entering addTracksToPlaylist(playlistId = ${playlistId}`);

    // Spotify API requires batches of 100 max
    const batchSize = 100;
    const batchedUris = chunk(trackUris, batchSize);

    const spotifyApi = await initSpotifyApi(accessToken);

    for (const uriBatch of batchedUris) {
        await doAndWaitForRateLimit(async () =>
            await spotifyApi.addTracksToPlaylist(playlistId, uriBatch),
        );
    }
}

export default addTracksToPlaylist;
