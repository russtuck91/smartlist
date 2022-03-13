import { Artist } from '../../core/shared-models';


export function mapToArtist(artistObjectFull: SpotifyApi.ArtistObjectFull): Artist {
    return {
        id: artistObjectFull.id,
        name: artistObjectFull.name,

        genres: artistObjectFull.genres,
        popularity: artistObjectFull.popularity,
    };
}
