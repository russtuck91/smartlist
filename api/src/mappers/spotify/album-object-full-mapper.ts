import { findImageAtLeastSize } from '../../../../shared';

import { Album } from '../../core/shared-models';


export function mapToAlbum(albumObjectFull: SpotifyApi.AlbumObjectFull): Album {
    return {
        id: albumObjectFull.id,
        name: albumObjectFull.name,

        artistIds: albumObjectFull.artists.map((a) => a.id),
        artistNames: albumObjectFull.artists.map((a) => a.name),

        releaseDate: albumObjectFull.release_date,
        thumbnail: findImageAtLeastSize(albumObjectFull.images, 40)?.url,
        genres: albumObjectFull.genres,
        popularity: albumObjectFull.popularity,
        trackIds: albumObjectFull.tracks.items.map((t) => t.id),
    };
}
