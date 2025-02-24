import logger from '../../core/logger/logger';
import maskToken from '../../core/logger/mask-token';
import doAndRetryWhenUnexpected from '../../core/utils/do-and-retry-when-unexpected';

import { getUserByAccessToken } from '../user-service';

import doAndWaitForRateLimit from './do-and-wait-for-rate-limit';
import initSpotifyApi from './init-spotify-api';
import { isSpotify401Error, isSpotifyError } from './types';


async function userHasPlaylist(playlistId: string, accessToken: string, existingValue: boolean): Promise<boolean> {
    logger.debug(`>>>> Entering userHasPlaylist(playlistId = ${playlistId} /// accessToken = ${maskToken(accessToken)}`);

    return await doAndRetryWhenUnexpected(async () => {
        const spotifyApi = await initSpotifyApi(accessToken);
        const user = await getUserByAccessToken(accessToken);
        try {
            const userFollowPlaylistResponse = await doAndWaitForRateLimit(async () => {
                return await spotifyApi.areFollowingPlaylist(user.username, playlistId, [user.username]);
            });
            const result = userFollowPlaylistResponse.body[0]!;
            logger.debug(`<<<< Exiting userHasPlaylist() after checking and user ${result ? 'DID' : 'DID NOT'} have this playlist.`);
            return result;
        } catch (e) {
            if (isSpotifyError(e)) {
                // Playlist not found
                if (
                    (e.body.error?.status === 404) ||
                    (e.body.error?.status === 502 && e.body.error?.message === 'Error while loading resource') ||
                    (e.body.error?.status === 400 && e.body.error?.message === 'Invalid base62 id')
                ) {
                    logger.info(`<<<< Exiting userHasPlaylist() from playlist not found exception, status = ${e.body.error?.status}, message = ${e.body.error?.message}`);
                    return false;
                }
            }
            if (!isSpotify401Error(e)) {
                logger.info('Error in userHasPlaylist()');
                logger.error(e);
            }
            throw e;
        }
    }, (result) => result !== existingValue, 10);
}

export default userHasPlaylist;
