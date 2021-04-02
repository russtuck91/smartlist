import { chunk } from 'lodash';

import logger from '../../core/logger/logger';

import initSpotifyApi from './init-spotify-api';


async function addTracksToPlaylist(playlistId: string, tracks: SpotifyApi.TrackObjectFull[], accessToken: string|undefined) {
    logger.debug(`>>>> Entering addTracksToPlaylist(playlistId = ${playlistId}`);
    const trackUris = tracks.map((track) => track.uri);

    // Spotify API requires batches of 100 max
    const batchSize = 100;
    const batchedUris = chunk(trackUris, batchSize);

    const spotifyApi = await initSpotifyApi(accessToken);

    batchedUris.map(async (uriBatch) => {
        await spotifyApi.addTracksToPlaylist(playlistId, uriBatch);
    });
}

export default addTracksToPlaylist;
