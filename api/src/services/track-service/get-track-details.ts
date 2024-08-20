import { TrackDetails } from '../../../../shared';

import logger from '../../core/logger/logger';

import spotifyCacheService from '../cache/spotify/spotify-cache-service';
import spotifyService from '../spotify-service/spotify-service';


async function getTrackDetails(id: string, accessToken: string|undefined): Promise<TrackDetails> {
    logger.debug(`>>>> Entering getTrackDetails(id = ${id}`);

    const track = await spotifyService.getTrackById(id, accessToken);

    const albumIds = [track.album.id];
    const artistIds = track.artists.map((a) => a.id);
    const albums = await spotifyCacheService.getAlbums(albumIds, accessToken);
    const artists = await spotifyCacheService.getArtists(artistIds, accessToken);

    const albumGenres = albums.reduce<string[]>((agg, album) => agg.concat(album.genres), []);
    const artistGenres = artists.reduce<string[]>((agg, artist) => agg.concat(artist.genres), []);
    const genres = [...new Set([...artistGenres, ...albumGenres])];

    const audioFeatures = await spotifyCacheService.getAudioFeatures([id], accessToken);

    return {
        genres,
        audioFeatures: audioFeatures[0]!,
    };
}

export default getTrackDetails;
