import logger from '../../core/logger/logger';

import doAndWaitForRateLimit from './do-and-wait-for-rate-limit';
import getFullPagedResults from './get-full-paged-results';
import initSpotifyApi from './init-spotify-api';
import { SpResponse } from './types';


async function getAlbumsForArtist(artistId: string, accessToken: string|undefined) {
    logger.debug(`>>>> Entering getAlbumsForArtist(artistId = ${artistId}`);

    const spotifyApi = await initSpotifyApi(accessToken);

    const result = await doAndWaitForRateLimit(
        async () => await getFullPagedResults(async (options) => {
            const apiResponse: SpResponse<SpotifyApi.ArtistsAlbumsResponse> = await spotifyApi.getArtistAlbums(artistId, options);

            return apiResponse.body;
        }),
    );
    const albums = result.items;

    logger.debug(`<<<< Exiting getAlbumsForArtist() after successful fetch with ${albums.length} albums`);
    return albums;
}

export default getAlbumsForArtist;
