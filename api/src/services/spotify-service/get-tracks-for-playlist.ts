import logger from '../../core/logger/logger';

import getFullPagedResults from './get-full-paged-results';
import initSpotifyApi from './init-spotify-api';
import { SpResponse } from './types';


async function getTracksForPlaylist(playlistId: string, accessToken: string|undefined): Promise<SpotifyApi.TrackObjectFull[]> {
    logger.debug(`>>>> Entering getTracksForPlaylist(playlistId = ${playlistId})`);

    const spotifyApi = await initSpotifyApi(accessToken);

    const result: SpotifyApi.PagingObject<SpotifyApi.PlaylistTrackObject>|undefined = await getFullPagedResults(async (options) => {
        const response: SpResponse<SpotifyApi.PlaylistTrackResponse> = await spotifyApi.getPlaylistTracks(playlistId, options);
        return response.body;
    });
    if (!result) return [];
    return result.items.map((item) => item.track);
}

export default getTracksForPlaylist;
