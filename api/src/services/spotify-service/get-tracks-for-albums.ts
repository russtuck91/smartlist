import { truncate } from 'lodash';

import logger from '../../core/logger/logger';

import createFullTrackObjectsFromAlbums from './create-full-track-objects-from-albums';
import getAlbums from './get-albums';


async function getTracksForAlbums(albumIds: string[], accessToken: string|undefined): Promise<SpotifyApi.TrackObjectFull[]> {
    logger.debug(`>>>> Entering getTracksForAlbums(albumIds = ${truncate(albumIds.join(','))}`);

    const albums = await getAlbums(albumIds, accessToken);
    const tracks = createFullTrackObjectsFromAlbums(albums);

    return tracks;
}

export default getTracksForAlbums;
