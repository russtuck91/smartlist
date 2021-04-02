import { PlaylistRule, RuleParam } from '../../../../shared';

import logger from '../../core/logger/logger';

import doAndWaitForRateLimit from './do-and-wait-for-rate-limit';
import getFullPagedResults from './get-full-paged-results';
import initSpotifyApi from './init-spotify-api';
import { SpResponse } from './types';


async function getFullSearchResults(rules: PlaylistRule[], accessToken: string|undefined): Promise<SpotifyApi.PagingObject<SpotifyApi.TrackObjectFull>|undefined> {
    logger.debug('>>>> Entering getFullSearchResults()');
    if (rules.length === 0) { return; }

    const spotifyApi = await initSpotifyApi(accessToken);

    let searchString = '';
    rules.map((rule) => {
        const fieldFilter = ((param) => {
            switch (param) {
                case RuleParam.Artist:
                    return 'artist';
                case RuleParam.Album:
                    return 'album';
                case RuleParam.Track:
                    return 'track';
                case RuleParam.Genre:
                    return 'genre';
                case RuleParam.Year:
                    return 'year';
                default:
                    return '';
            }
        })(rule.param);
        searchString += `${fieldFilter}:"${rule.value}"`;
    });
    logger.debug(`searchString :: ${searchString}`);

    return await doAndWaitForRateLimit(async () => await getFullPagedResults(async (options) => {
        // maximum offset is 2000 - handled as 404 error
        const apiResponse: SpResponse<SpotifyApi.SearchResponse> = await spotifyApi.search(searchString, [ 'track' ], options);

        return apiResponse.body.tracks;
    }));
}

export default getFullSearchResults;
