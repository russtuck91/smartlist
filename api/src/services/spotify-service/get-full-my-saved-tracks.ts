import logger from '../../core/logger/logger';

import getFullPagedResults from './get-full-paged-results';
import initSpotifyApi from './init-spotify-api';
import { SpResponse } from './types';


async function getFullMySavedTracks(accessToken: string|undefined, maxPages?: number): Promise<SpotifyApi.SavedTrackObject[]> {
    logger.debug('>>>> Entering getFullMySavedTracks()');

    const spotifyApi = await initSpotifyApi(accessToken);

    const pagingResult: SpotifyApi.PagingObject<SpotifyApi.SavedTrackObject>|undefined = await getFullPagedResults(async (options) => {
        const apiResponse: SpResponse<SpotifyApi.PagingObject<SpotifyApi.SavedTrackObject>> = await spotifyApi.getMySavedTracks(options);

        return apiResponse.body;
    }, maxPages);
    if (!pagingResult) return [];
    // Despite documentation, `obj` can sometimes be null
    const savedTrackObjects: (SpotifyApi.SavedTrackObject|null)[] = pagingResult.items;
    const result = savedTrackObjects.filter((obj): obj is SpotifyApi.SavedTrackObject => !!obj && !!obj.track);
    return result;
}

export default getFullMySavedTracks;
