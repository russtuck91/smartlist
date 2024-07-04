import logger from '../../core/logger/logger';
import maskToken from '../../core/logger/mask-token';

import { getUserByAccessToken } from '../user-service';

import doAndWaitForRateLimit from './do-and-wait-for-rate-limit';
import getFullPagedResults from './get-full-paged-results';
import initSpotifyApi from './init-spotify-api';


async function getUsersPlaylists(accessToken: string): Promise<SpotifyApi.PagingObject<SpotifyApi.PlaylistObjectSimplified>> {
    logger.debug(`>>>> Entering getUsersPlaylists(accessToken = ${maskToken(accessToken)}`);

    const spotifyApi = await initSpotifyApi(accessToken);

    const result = await doAndWaitForRateLimit(
        async () => await getFullPagedResults(async (options) => {
            const response = await spotifyApi.getUserPlaylists(options);
            return response.body;
        }),
    );

    // Temp logging specific to user
    const user = await getUserByAccessToken(accessToken);
    if (user?.id === '5ed7d5f1b50fdd98fb12caec' && result?.items.length <= 200) {
        logger.info('ALERT: Issue with my user playlists :: ', result?.items.length);
        const { items, ...restOfResult } = result;
        logger.info(`result type is ${typeof restOfResult} and value is...`);
        logger.info(JSON.stringify(restOfResult));
        logger.info(`result.total is ${result.total}`);
        logger.info(`result.items.length is ${items.length}`);
        logger.info(`result.items type is ${typeof items} and value is...`);
        logger.info(JSON.stringify(items));
    }
    logger.debug(`<<<< Exiting getUsersPlaylists() after finding user has ${result?.items.length} playlists`);
    return result;
}

export default getUsersPlaylists;
