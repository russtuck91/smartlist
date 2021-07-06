import { chunk, truncate } from 'lodash';

import logger from '../../core/logger/logger';

import doAndWaitForRateLimit from './do-and-wait-for-rate-limit';
import initSpotifyApi from './init-spotify-api';

async function getAudioFeatures(trackIds: string[], accessToken: string|undefined) {
    logger.debug(`>>>> Entering getAudioFeatures(trackIds = ${truncate(trackIds.join(','))}`);

    const spotifyApi = await initSpotifyApi(accessToken);

    // Spotify API requires batches of 100 max
    const batchSize = 100;
    const batchedIds = chunk(trackIds, batchSize);

    let audioFeatures: SpotifyApi.AudioFeaturesObject[] = [];
    for (const batch of batchedIds) {
        await doAndWaitForRateLimit(async () => {
            const response = await spotifyApi.getAudioFeaturesForTracks(batch);
            audioFeatures = audioFeatures.concat(response.body.audio_features);
        });
    }

    return audioFeatures;
}

export default getAudioFeatures;
