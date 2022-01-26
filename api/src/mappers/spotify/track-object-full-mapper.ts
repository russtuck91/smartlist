import { findImageAtLeastSize, Track } from '../../../../shared';


export function mapToTrack(trackObjectFull: SpotifyApi.TrackObjectFull): Track {
    return {
        id: trackObjectFull.id,
        name: trackObjectFull.name,
        uri: trackObjectFull.uri,

        albumId: trackObjectFull.album.id,
        albumName: trackObjectFull.album.name,
        albumReleaseDate: trackObjectFull.album.release_date,
        albumThumbnail: findImageAtLeastSize(trackObjectFull.album.images, 40)?.url,

        artistIds: trackObjectFull.artists.map((a) => a.id),
        artistNames: trackObjectFull.artists.map((a) => a.name),

        disc_number: trackObjectFull.disc_number,
        duration_ms: trackObjectFull.duration_ms,
        popularity: trackObjectFull.popularity,
        track_number: trackObjectFull.track_number,
    };
}

