import { SearchItem } from '../../../../shared';

import logger from '../../core/logger/logger';

import doAndWaitForRateLimit from './do-and-wait-for-rate-limit';
import getFullPagedResults from './get-full-paged-results';
import initSpotifyApi from './init-spotify-api';
import { SpResponse } from './types';


async function searchForItem(type: 'album'|'artist'|'playlist'|'track', item: string, accessToken: string|undefined) {
    logger.debug('>>>> Entering searchForItem()');

    const spotifyApi = await initSpotifyApi(accessToken);

    const searchString = `${type}:"${item}"`;

    return await doAndWaitForRateLimit(async () => await getFullPagedResults(async (options) => {
        const apiResponse: SpResponse<SpotifyApi.SearchResponse> = await spotifyApi.search(searchString, [ type ], options);

        const result: SpotifyApi.PagingObject<SearchItem> = apiResponse.body[`${type}s`]!;
        return result;
    }));
}

export default searchForItem;
