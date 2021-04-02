import { SpotifyApi } from '../../core/spotify/spotify-api';

import { getCurrentUser } from '../user-service';

async function setAccessTokenFromCurrentUser(spotifyApi: SpotifyApi) {
    try {
        const user = await getCurrentUser();
        if (user) {
            spotifyApi.setAccessToken(user.accessToken);
        }
    } catch (e) {
        // no current user, ignore
    }
}

export default setAccessTokenFromCurrentUser;
