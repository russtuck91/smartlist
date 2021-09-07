import logger from '../../core/logger/logger';

import doAndWaitForRateLimit from './do-and-wait-for-rate-limit';
import initSpotifyApi from './init-spotify-api';


interface ChangePlaylistOptions {
    name?: string;
    description?: string;
    collaborative?: boolean;
    public?: boolean;
}

async function updatePlaylistDetails(playlistId: string, options: ChangePlaylistOptions, accessToken: string|undefined) {
    logger.debug(`>>>> Entering updatePlaylistDetails(playlistId = ${playlistId}`);

    const spotifyApi = await initSpotifyApi(accessToken);

    await doAndWaitForRateLimit(async () => {
        await spotifyApi.changePlaylistDetails(playlistId, options);
    });
}

export default updatePlaylistDetails;
