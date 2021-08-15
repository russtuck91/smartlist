import logger from '../../core/logger/logger';

import initSpotifyApi from './init-spotify-api';


async function getTrackById(trackId: string, accessToken: string|undefined): Promise<SpotifyApi.TrackObjectFull> {
    logger.debug(`>>>> Entering getTrackById(trackId = ${trackId}`);

    const spotifyApi = await initSpotifyApi(accessToken);

    const track = await spotifyApi.getTrack(trackId);

    return track.body;
}

export default getTrackById;
