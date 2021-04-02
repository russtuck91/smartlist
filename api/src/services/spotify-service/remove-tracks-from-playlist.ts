import logger from '../../core/logger/logger';

import initSpotifyApi from './init-spotify-api';


async function removeTracksFromPlaylist(playlistId: string, accessToken: string|undefined) {
    logger.debug(`>>>> Entering removeTracksFromPlaylist(playlistId = ${playlistId}`);

    const spotifyApi = await initSpotifyApi(accessToken);

    await spotifyApi.replaceTracksInPlaylist(playlistId, []);
}

export default removeTracksFromPlaylist;
