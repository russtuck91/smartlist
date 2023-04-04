import { truncate } from 'lodash';

import logger from '../../core/logger/logger';

import doAndWaitForRateLimit from './do-and-wait-for-rate-limit';
import getFullPagedResults from './get-full-paged-results';
import initSpotifyApi from './init-spotify-api';
import { SpResponse } from './types';


async function getAlbumsForArtists(artistIds: string[], accessToken: string|undefined) {
    logger.debug(`>>>> Entering getAlbumsForArtists(artistIds = ${truncate(artistIds.join(','))}`);

    const spotifyApi = await initSpotifyApi(accessToken);

    let albums: SpotifyApi.AlbumObjectSimplified[] = [];
    for (const artistId of artistIds) {
        const thisArtistAlbums = await doAndWaitForRateLimit(
            async () => await getFullPagedResults(async (options) => {
                const apiResponse: SpResponse<SpotifyApi.ArtistsAlbumsResponse> = await spotifyApi.getArtistAlbums(artistId, options);

                return apiResponse.body;
            }),
        );
        albums = albums.concat(thisArtistAlbums?.items || []);
    }

    return albums;
}

export default getAlbumsForArtists;
