import logger from '../../../core/logger/logger';

import albumCacheService from './album-cache-service';
import albumsForArtistCacheService from './albums-for-artist-cache-service';
import trackCacheService from './track-cache-service';


async function getTracksForArtist(artistId: string, accessToken: string) {
    logger.debug(`>>>> Entering getTracksForArtist(artistId = ${artistId}`);

    const albumsForArtist = await albumsForArtistCacheService.getItems([artistId], accessToken);
    const albumIds = albumsForArtist[0]!.albumIds;

    const albums = await albumCacheService.getItems(albumIds, accessToken);
    const tracks = await trackCacheService.getItems(albums.map((a) => a.trackIds).flat(), accessToken);

    // Filter out for compilation albums with different artists
    const filteredTracks = tracks.filter((track) => track.artistIds.some((artist) => artistId.includes(artist)));

    return filteredTracks;
}

export default getTracksForArtist;
