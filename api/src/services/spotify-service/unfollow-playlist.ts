import logger from '../../core/logger/logger';

import initSpotifyApi from './init-spotify-api';


async function unfollowPlaylist(playlistId: string, accessToken: string|undefined) {
    logger.debug(`>>>> Entering unfollowPlaylist(playlistId = ${playlistId}`);

    const spotifyApi = await initSpotifyApi(accessToken);

    await spotifyApi.unfollowPlaylist(playlistId);
}

export default unfollowPlaylist;
