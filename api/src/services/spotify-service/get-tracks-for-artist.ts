import logger from '../../core/logger/logger';

import getAlbumsForArtist from './get-albums-for-artist';
import getTracksForAlbums from './get-tracks-for-albums';


async function getTracksForArtist(artistId: string, accessToken: string|undefined) {
    logger.debug(`>>>> Entering getTracksForArtist(artistId = ${artistId}`);

    const albums = await getAlbumsForArtist(artistId, accessToken);
    const tracks = await getTracksForAlbums(albums.map((album) => album.id), accessToken);
    // Filter out for compilation albums with different artists
    const filteredTracks = tracks.filter((track) => track.artists.some((artist) => artistId === artist.id));

    return filteredTracks;
}

export default getTracksForArtist;
