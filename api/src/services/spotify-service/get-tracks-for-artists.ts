
import { truncate } from 'lodash';

import logger from '../../core/logger/logger';

import getAlbumsForArtists from './get-albums-for-artists';
import getTracksForAlbums from './get-tracks-for-albums';


async function getTracksForArtists(artistIds: string[], accessToken: string|undefined) {
    logger.debug(`>>>> Entering getTracksForArtists(artistIds = ${truncate(artistIds.join(','))}`);

    const albums = await getAlbumsForArtists(artistIds, accessToken);
    const tracks = await getTracksForAlbums(albums.map((album) => album.id), accessToken);
    // Filter out for compilation albums with different artists
    const filteredTracks = tracks.filter((track) => track.artists.some((artist) => artistIds.includes(artist.id)));

    return filteredTracks;
}

export default getTracksForArtists;
