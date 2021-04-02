function createFullTrackObjectsFromAlbums(albums: SpotifyApi.AlbumObjectFull[]): SpotifyApi.TrackObjectFull[] {
    let tracks: SpotifyApi.TrackObjectFull[] = [];
    tracks = albums.reduce((agg, curr) => {
        const fullTrackObjects: SpotifyApi.TrackObjectFull[] = curr.tracks.items.map((item) => ({
            ...item,
            album: curr,
            external_ids: null,
            popularity: null,
        } as unknown as SpotifyApi.TrackObjectFull));
        return agg.concat(fullTrackObjects);
    }, tracks);
    return tracks;
}

export default createFullTrackObjectsFromAlbums;
