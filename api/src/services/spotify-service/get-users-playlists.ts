import logger from '../../core/logger/logger';
import maskToken from '../../core/logger/mask-token';
import { SpotifyApi } from '../../core/spotify/spotify-api';

import doAndWaitForRateLimit from './do-and-wait-for-rate-limit';
import getFullPagedResults from './get-full-paged-results';
import setAccessTokenFromCurrentUser from './set-access-token-from-current-user';


async function getUsersPlaylists(accessToken: string): Promise<SpotifyApi.PagingObject<SpotifyApi.PlaylistObjectSimplified>> {
    logger.info(`>>>> Entering getUsersPlaylists(accessToken = ${maskToken(accessToken)}`);

    const spotifyApi = new SpotifyApi();
    if (accessToken) { spotifyApi.setAccessToken(accessToken); }
    await setAccessTokenFromCurrentUser(spotifyApi);

    const result = await doAndWaitForRateLimit(
        async () => await getFullPagedResults(async (options) => {
            const response = await spotifyApi.getUserPlaylists(options);
            return response.body;
        }),
    );

    logger.info(`<<<< Exiting getUsersPlaylists() after finding user has ${result?.items.length} playlists`);
    return result;
}

export default getUsersPlaylists;
