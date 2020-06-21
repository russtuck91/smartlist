import { chunk } from 'lodash';
import { ObjectId } from 'mongodb';

import { PlaylistRule, RuleParam } from '../../../shared/src';

import { SpotifyApi } from '../core/spotify/spotify-api';
import { sleep } from '../core/utils/utils';
import { getUserById, getCurrentUser } from './user-service';


interface SpResponse<T> {
    body: T;
    headers: Record<string, string>;
    statusCode: number;
}


export async function getMe(accessToken?: string): Promise<SpotifyApi.CurrentUsersProfileResponse> {
    const spotifyApi = new SpotifyApi();
    if (accessToken) { spotifyApi.setAccessToken(accessToken); }
    await setAccessTokenFromCurrentUser(spotifyApi);

    const userInfo = await spotifyApi.getMe();
    const user: SpotifyApi.CurrentUsersProfileResponse = userInfo.body;

    return user;
}


async function getFullPagedResults(fn: (options: object) => Promise<SpotifyApi.PagingObject<any>|undefined>) {
    try {
        console.log('in getFullPagedResults');
        let result: SpotifyApi.PagingObject<any>|undefined;
        let offset = 0;
        const batchSize = 50;

        // while number fetched is less than total reported, send request
        while (!result || result.total > result.items.length) {
            const options = { limit: batchSize, offset: offset };
            const response = await fn(options);

            if (!response) {
                // TODO
                throw Error();
            }

            if (!result) {
                result = response;
            } else {
                // take list from response and add it to result
                result.items.push(...response.items);
            }

            offset += batchSize;
        }

        return result;
    } catch (e) {
        throw e;
    }
}

async function setAccessTokenFromCurrentUser(spotifyApi: SpotifyApi) {
    try {
        const user = await getCurrentUser();
        if (user) {
            spotifyApi.setAccessToken(user.accessToken);
        }
    } catch (e) {
        // no current user, ignore
    }
}

export async function getFullMySavedTracks(accessToken?: string): Promise<SpotifyApi.PagingObject<SpotifyApi.SavedTrackObject>|undefined> {
    console.log('in getFullMySavedTracks');

    const spotifyApi = new SpotifyApi();
    await setAccessTokenFromCurrentUser(spotifyApi);
    if (accessToken) { spotifyApi.setAccessToken(accessToken); }

    return getFullPagedResults(async (options) => {
        const apiResponse: SpResponse<SpotifyApi.PagingObject<SpotifyApi.SavedTrackObject>> = await spotifyApi.getMySavedTracks(options);

        return apiResponse.body;
    });
}

export async function getFullSearchResults(rules: PlaylistRule[], accessToken?: string): Promise<SpotifyApi.PagingObject<any>|undefined> {
    console.log('in getFullSearchResults');

    const spotifyApi = new SpotifyApi();
    if (accessToken) { spotifyApi.setAccessToken(accessToken); }
    await setAccessTokenFromCurrentUser(spotifyApi);

    let searchString = '';
    rules.map((rule) => {
        const fieldFilter = ((param) => {
            switch (param) {
                case RuleParam.Artist:
                    return 'artist';
                case RuleParam.Album:
                    return 'album';
                case RuleParam.Track:
                    return 'track';
                case RuleParam.Genre:
                    return 'genre';
                case RuleParam.Year:
                    return 'year';
                default:
                    return '';
            }
        })(rule.param);
        searchString += `${fieldFilter}:"${rule.value}"`;
    });

    return doAndWaitForRateLimit(async () => await getFullPagedResults(async (options) => {
        const apiResponse: SpResponse<SpotifyApi.SearchResponse> = await spotifyApi.search(searchString, [ 'track' ], options);

        return apiResponse.body.tracks;
    }));
}


export async function createNewPlaylist(playlistName: string, userId: ObjectId) {
    console.log('in createNewPlaylist');

    const user = await getUserById(userId);
    const spotifyApi = new SpotifyApi();
    spotifyApi.setAccessToken(user.accessToken);

    const playlist = await spotifyApi.createPlaylist(user.username, playlistName, {
        description: 'Created by SmartList'
    });

    return playlist.body;
}

export async function removeTracksFromPlaylist(playlistId: string, accessToken?: string) {
    console.log('in removeTracksFromPlaylist');

    const spotifyApi = new SpotifyApi();
    if (accessToken) { spotifyApi.setAccessToken(accessToken); }
    await setAccessTokenFromCurrentUser(spotifyApi);

    await spotifyApi.replaceTracksInPlaylist(playlistId, []);
}

export async function addTracksToPlaylist(playlistId: string, tracks: SpotifyApi.TrackObjectFull[], accessToken?: string) {
    console.log('in addTracksToPlaylist');
    const trackUris = tracks.map((track) => track.uri);

    // Spotify API requires batches of 100 max
    const batchSize = 100;
    const batchedUris = chunk(trackUris, batchSize);

    const spotifyApi = new SpotifyApi();
    if (accessToken) { spotifyApi.setAccessToken(accessToken); }
    await setAccessTokenFromCurrentUser(spotifyApi);

    batchedUris.map(async (uriBatch) => {
        await spotifyApi.addTracksToPlaylist(playlistId, uriBatch);
    });
}


export async function getAlbum(albumId: string, accessToken?: string): Promise<SpotifyApi.SingleAlbumResponse> {
    console.log('in getAlbum');

    const spotifyApi = new SpotifyApi();
    if (accessToken) { spotifyApi.setAccessToken(accessToken); }
    await setAccessTokenFromCurrentUser(spotifyApi);

    const albumResponse = await spotifyApi.getAlbum(albumId);
    const album = albumResponse.body;

    return album;
}

async function doAndWaitForRateLimit(bodyFn: () => Promise<any>) {
    console.log('in doAndWaitForRateLimit');
    try {
        return await bodyFn();
    } catch (e) {
        console.log('error found in doAndWaitForRateLimit');
        if (e.statusCode === 429) {
            // e.headers not yet passed from spotify-web-api-node
            const retryAfterSec = e.headers && e.headers['retry-after'] ? parseInt(e.headers['retry-after']) : 3;
            // wait x seconds
            await sleep(retryAfterSec * 1000);

            // run bodyFn again
            return await bodyFn();
        }

        console.log(e);
        throw e;
    }
}

export async function getAlbums(albumIds: string[], accessToken?: string): Promise<SpotifyApi.AlbumObjectFull[]> {
    console.log('in getAlbums');

    const spotifyApi = new SpotifyApi();
    if (accessToken) { spotifyApi.setAccessToken(accessToken); }
    await setAccessTokenFromCurrentUser(spotifyApi);

    // Spotify API requires batches of 20 max
    const batchSize = 20;
    const batchedIds = chunk(albumIds, batchSize);

    let albums: SpotifyApi.AlbumObjectFull[] = [];
    for (const batch of batchedIds) {
        await doAndWaitForRateLimit(async () => {
            console.log('access token :: ', spotifyApi.getAccessToken());

            const albumResponse = await spotifyApi.getAlbums(batch);
            albums = albums.concat(albumResponse.body.albums);
        });
    }

    return albums;
}

export async function getArtists(artistIds: string[], accessToken?: string): Promise<SpotifyApi.ArtistObjectFull[]> {
    console.log('in getArtists');

    const spotifyApi = new SpotifyApi();
    if (accessToken) { spotifyApi.setAccessToken(accessToken); }
    await setAccessTokenFromCurrentUser(spotifyApi);

    // Spotify API requires batches of 50 max
    const batchSize = 50;
    const batchedIds = chunk(artistIds, batchSize);

    let artists: SpotifyApi.ArtistObjectFull[] = [];
    for (const batch of batchedIds) {
        await doAndWaitForRateLimit(async () => {
            console.log('access token :: ', spotifyApi.getAccessToken());

            const artistResponse = await spotifyApi.getArtists(batch);
            artists = artists.concat(artistResponse.body.artists);
        });
    }

    return artists;
}

