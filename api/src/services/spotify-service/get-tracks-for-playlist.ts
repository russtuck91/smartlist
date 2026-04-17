import logger from '../../core/logger/logger';

import doAndWaitForRateLimit from './do-and-wait-for-rate-limit';
import getFullPagedResults from './get-full-paged-results';
import initSpotifyApi from './init-spotify-api';
import { SpResponse } from './types';


async function getTracksForPlaylist(playlistId: string, accessToken: string|undefined): Promise<SpotifyApi.TrackObjectFull[]> {
    logger.debug(`>>>> Entering getTracksForPlaylist(playlistId = ${playlistId})`);

    const spotifyApi = await initSpotifyApi(accessToken);

    const result: SpotifyApi.PagingObject<SpotifyApi.PlaylistTrackObject>|undefined = await getFullPagedResults(
        async (options) => await doAndWaitForRateLimit(async () => {
            const response: SpResponse<SpotifyApi.PlaylistTrackResponse> = await spotifyApi.getPlaylistTracks(playlistId, options);
            return response.body;
        }),
    );
    if (!result) return [];
    // Despite documentation, `track` can sometimes be null
    const resultTracks: (SpotifyApi.TrackObjectFull|null)[] = result.items.map((item) => item.track);
    const tracks = resultTracks.filter((t): t is SpotifyApi.TrackObjectFull => !!t && !!t.id);
    return tracks;
}

export default getTracksForPlaylist;
