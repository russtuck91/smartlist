import { chunk } from 'lodash';

import logger from '../../core/logger/logger';

import doAndWaitForRateLimit from './do-and-wait-for-rate-limit';
import initSpotifyApi from './init-spotify-api';
import { isSpotifyError } from './types';


// Spotify API requires batches of 100 max
export const batchSize = 100;

async function addTracksToPlaylist(playlistId: string, trackUris: string[], accessToken: string|undefined) {
    logger.debug(`>>>> Entering addTracksToPlaylist(playlistId = ${playlistId}, trackUris.length = ${trackUris.length}`);

    const batchedUris = chunk(trackUris, batchSize);

    const spotifyApi = await initSpotifyApi(accessToken);

    for (const uriBatch of batchedUris) {
        try {
            await doAndWaitForRateLimit(async () =>
                await spotifyApi.addTracksToPlaylist(playlistId, uriBatch),
            );
        } catch (e) {
            logger.info(`Error in addTracksToPlaylist batch(playlistId = ${playlistId}, trackUris.length = ${trackUris.length}`);
            logger.info(uriBatch);
            handleError(e);
        }
    }
}

function handleError(e) {
    if (isSpotifyError(e)) {
        if (e.statusCode === 400) {
            if (e.body.error?.message === 'Invalid base62 id') {
                logger.info('Error was an invalid base62');
                return;
            }
        }
    }
    logger.error(e);
    throw e;
}

export default addTracksToPlaylist;
