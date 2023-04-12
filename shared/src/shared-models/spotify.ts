import { SearchItem } from './playlist-rule';


export function isAlbumObjectSimplified(value: SearchItem): value is SpotifyApi.AlbumObjectSimplified {
    const cast = value as SpotifyApi.AlbumObjectSimplified;
    return (
        cast.id !== undefined &&
        cast.name !== undefined &&
        cast.external_urls !== undefined &&
        cast.type === 'album'
    );
}

export function isTrackObjectFull(value: SearchItem): value is SpotifyApi.TrackObjectFull {
    const cast = value as SpotifyApi.TrackObjectFull;
    return (
        cast.id !== undefined &&
        cast.name !== undefined &&
        cast.artists !== undefined &&
        cast.external_urls !== undefined &&
        cast.type === 'track' &&
        cast.album !== undefined
    );
}

export function isPlaylistObjectSimplified(value: SearchItem): value is SpotifyApi.PlaylistObjectSimplified {
    const cast = value as SpotifyApi.PlaylistObjectSimplified;
    return (
        cast.id !== undefined &&
        cast.name !== undefined &&
        cast.external_urls !== undefined &&
        cast.owner !== undefined &&
        cast.type === 'playlist' &&
        cast.tracks !== undefined
    );
}
