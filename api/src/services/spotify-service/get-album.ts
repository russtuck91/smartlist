import logger from '../../core/logger/logger';

import initSpotifyApi from './init-spotify-api';


async function getAlbum(albumId: string, accessToken: string|undefined): Promise<SpotifyApi.SingleAlbumResponse> {
    logger.debug(`>>>> Entering getAlbum(albumId = ${albumId}`);

    const spotifyApi = await initSpotifyApi(accessToken);

    const albumResponse = await spotifyApi.getAlbum(albumId);
    const album = albumResponse.body;

    return album;
}

export default getAlbum;
