import { chunk, truncate, uniq } from 'lodash';

import logger from '../../core/logger/logger';

import doAndWaitForRateLimit from './do-and-wait-for-rate-limit';
import initSpotifyApi from './init-spotify-api';


async function getTracksById(trackIds: string[], accessToken: string|undefined): Promise<SpotifyApi.TrackObjectFull[]> {
    logger.debug(`>>>> Entering getTracksById(albumIds = ${truncate(trackIds.join(','))}`);

    const spotifyApi = await initSpotifyApi(accessToken);

    // Spotify API requires batches of 50 max
    const batchSize = 50;
    const batchedIds = chunk(uniq(trackIds), batchSize);

    let tracks: SpotifyApi.TrackObjectFull[] = [];
    for (const batch of batchedIds) {
        await doAndWaitForRateLimit(async () => {
            const trackResponse = await spotifyApi.getTracks(batch);
            tracks = tracks.concat(trackResponse.body.tracks);
        });
    }

    return tracks;
}

export default getTracksById;
