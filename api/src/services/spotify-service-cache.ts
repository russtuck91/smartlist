import logger from '../core/logger/logger';

import spotifyService from './spotify-service/spotify-service';


export class SpotifyServiceCache {
    private albumMap: Record<string, SpotifyApi.AlbumObjectFull> = {};
    private artistMap: Record<string, SpotifyApi.ArtistObjectFull> = {};


    public async getAlbums(albumIds: string[], accessToken: string|undefined) {
        logger.debug('>>>> Entering SpotifyServiceCache.getAlbums()');

        const albumsToBeFetched: string[] = albumIds.filter((albumId) => !this.albumMap[albumId]);
        logger.debug('# albums requested:', albumIds.length);
        logger.debug('# albums not cached, will be fetched:', albumsToBeFetched.length);

        const fetchedAlbums = await spotifyService.getAlbums(albumsToBeFetched, accessToken);

        // Add results to albumMap
        this.albumMap = fetchedAlbums.reduce((obj, item) => {
            obj[item.id] = item;
            return obj;
        }, this.albumMap);

        // Return map of requested ids
        const returnAlbumMap: Record<string, SpotifyApi.AlbumObjectFull> = albumIds.reduce((obj, item) => {
            obj[item] = this.albumMap[item];
            return obj;
        }, {});
        return returnAlbumMap;
    }

    public async getArtists(artistIds: string[], accessToken: string|undefined) {
        logger.debug('>>>> Entering SpotifyServiceCache.getArtists()');
        // For each artist ID, add to array if not in artistMap cache
        const artistsToBeFetched: string[] = artistIds.filter((artistId) => !this.artistMap[artistId]);
        logger.debug('# artists requested:', artistIds.length);
        logger.debug('# artists not cached, will be fetched:', artistsToBeFetched.length);

        // Send artistsIds for fetching to spotifyService
        const fetchedArtists = await spotifyService.getArtists(artistsToBeFetched, accessToken);

        // Add results to artistMap
        this.artistMap = fetchedArtists.reduce((obj, item) => {
            obj[item.id] = item;
            return obj;
        }, this.artistMap);

        // Return map of requested artistIds
        const returnArtistMap: Record<string, SpotifyApi.ArtistObjectFull> = artistIds.reduce((obj, item) => {
            obj[item] = this.artistMap[item];
            return obj;
        }, {});
        return returnArtistMap;
    }

}

export const spCache = new SpotifyServiceCache();

