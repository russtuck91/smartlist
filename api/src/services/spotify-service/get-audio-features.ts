import { chunk, truncate, uniq } from 'lodash';

import logger from '../../core/logger/logger';

import doAndWaitForRateLimit from './do-and-wait-for-rate-limit';
import initSpotifyApi from './init-spotify-api';

async function getAudioFeatures(trackIds: string[], accessToken: string|undefined): Promise<SpotifyApi.AudioFeaturesObject[]> {
    logger.debug(`>>>> Entering getAudioFeatures(trackIds = ${truncate(trackIds.join(','))}`);

    const spotifyApi = await initSpotifyApi(accessToken);

    // Spotify API requires batches of 100 max
    const batchSize = 100;
    const batchedIds = chunk(uniq(trackIds), batchSize);

    let resultAudioFeatures: (SpotifyApi.AudioFeaturesObject|null)[] = [];
    for (const batch of batchedIds) {
        await doAndWaitForRateLimit(async () => {
            const response = await spotifyApi.getAudioFeaturesForTracks(batch);
            resultAudioFeatures = resultAudioFeatures.concat(response.body.audio_features);
        });
    }

    // Despite documentation, `af` can sometimes be null
    const audioFeatures = resultAudioFeatures.filter((af): af is SpotifyApi.AudioFeaturesObject => !!af);
    return audioFeatures;
}

export default getAudioFeatures;
