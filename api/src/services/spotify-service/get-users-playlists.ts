import logger from '../../core/logger/logger';
import { SpotifyApi } from '../../core/spotify/spotify-api';

import getFullPagedResults from './get-full-paged-results';
import setAccessTokenFromCurrentUser from './set-access-token-from-current-user';


async function getUsersPlaylists(id: string, accessToken: string|undefined): Promise<SpotifyApi.PagingObject<SpotifyApi.PlaylistObjectSimplified>|undefined> {
    logger.debug('>>>> Entering getUsersPlaylists()');

    const spotifyApi = new SpotifyApi();
    if (accessToken) { spotifyApi.setAccessToken(accessToken); }
    await setAccessTokenFromCurrentUser(spotifyApi);

    const result = await getFullPagedResults(async (options) => {
        const response = await spotifyApi.getUserPlaylists(options);
        return response.body;
    });

    return result;
}

export default getUsersPlaylists;
