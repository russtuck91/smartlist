import { SpotifyApi } from '../../core/spotify/spotify-api';

import setAccessTokenFromCurrentUser from './set-access-token-from-current-user';

async function initSpotifyApi(accessToken: string|undefined) {
    const spotifyApi = new SpotifyApi();
    if (accessToken) {
        spotifyApi.setAccessToken(accessToken);
    } else {
        await setAccessTokenFromCurrentUser(spotifyApi);
    }
    return spotifyApi;
}

export default initSpotifyApi;
