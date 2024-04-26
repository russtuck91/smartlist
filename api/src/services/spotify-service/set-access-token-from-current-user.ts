import logger from '../../core/logger/logger';
import maskToken from '../../core/logger/mask-token';
import { SpotifyApi } from '../../core/spotify/spotify-api';

import { getCurrentUser } from '../user-service';


async function setAccessTokenFromCurrentUser(spotifyApi: SpotifyApi) {
    try {
        const user = await getCurrentUser();
        if (user) {
            logger.info(`Found current user ${user.id} with accessToken = ${maskToken(user.accessToken)}`);
            spotifyApi.setAccessToken(user.accessToken);
        }
    } catch (e) {
        // no current user, ignore
    }
}

export default setAccessTokenFromCurrentUser;
