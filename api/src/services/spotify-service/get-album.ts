import logger from '../../core/logger/logger';
import { SpotifyApi } from '../../core/spotify/spotify-api';

import setAccessTokenFromCurrentUser from './set-access-token-from-current-user';

async function getAlbum(albumId: string, accessToken: string|undefined): Promise<SpotifyApi.SingleAlbumResponse> {
    logger.debug(`>>>> Entering getAlbum(albumId = ${albumId}`);

    const spotifyApi = new SpotifyApi();
    if (accessToken) { spotifyApi.setAccessToken(accessToken); }
    await setAccessTokenFromCurrentUser(spotifyApi);

    const albumResponse = await spotifyApi.getAlbum(albumId);
    const album = albumResponse.body;

    return album;
}

export default getAlbum;
