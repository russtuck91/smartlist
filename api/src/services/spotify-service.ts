import httpContext from 'express-http-context';
import { chunk } from 'lodash';
import { ObjectId } from 'mongodb';

import { PlaylistRule, RuleParam } from '../../../shared/src/playlists/models';

import { spotifyApi } from '../core/spotify/spotify-api';
import { getUserById } from './user-service';


interface SpResponse<T> {
    body: T;
    headers: Record<string, string>;
    statusCode: number;
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

export async function getFullMySavedTracks(): Promise<SpotifyApi.PagingObject<SpotifyApi.SavedTrackObject>|undefined> {
    console.log('in getFullMySavedTracks');

    const accessToken = httpContext.get('accessToken');
    // console.log('accessToken :: ', accessToken);
    if (accessToken) { spotifyApi.setAccessToken(accessToken); }

    return getFullPagedResults(async (options) => {
        const apiResponse: SpResponse<SpotifyApi.PagingObject<SpotifyApi.SavedTrackObject>> = await spotifyApi.getMySavedTracks(options);

        return apiResponse.body;
    });
}

export async function getFullSearchResults(rules: PlaylistRule[]): Promise<SpotifyApi.PagingObject<any>|undefined> {
    console.log('in getFullSearchResults');

    const accessToken = httpContext.get('accessToken');
    // console.log('accessToken :: ', accessToken);
    if (accessToken) { spotifyApi.setAccessToken(accessToken); }
    console.log('!!! access token ::', spotifyApi.getAccessToken());

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

    return getFullPagedResults(async (options) => {
        const apiResponse: SpResponse<SpotifyApi.SearchResponse> = await spotifyApi.search(searchString, [ 'track' ], options);

        return apiResponse.body.tracks;
    });
}

export async function createNewPlaylist(playlistName: string, userId: ObjectId) {
    console.log('in createNewPlaylist');

    const user = await getUserById(userId);
    spotifyApi.setAccessToken(user.accessToken);

    const playlist = await spotifyApi.createPlaylist(user.username, playlistName, {
        description: 'Created by SmartList'
    });

    return playlist.body;
}

export async function removeTracksFromPlaylist(playlistId: string) {
    console.log('in removeTracksFromPlaylist');

    const accessToken = httpContext.get('accessToken');
    // console.log('accessToken :: ', accessToken);
    if (accessToken) { spotifyApi.setAccessToken(accessToken); }

    await spotifyApi.replaceTracksInPlaylist(playlistId, []);
}

export async function addTracksToPlaylist(playlistId: string, tracks: SpotifyApi.TrackObjectFull[]) {
    console.log('in addTracksToPlaylist');
    const trackUris = tracks.map((track) => track.uri);

    // Spotify API requires batches of 100 max
    const batchSize = 100;
    const batchedUris = chunk(trackUris, batchSize);

    const accessToken = httpContext.get('accessToken');
    // console.log('accessToken :: ', accessToken);
    if (accessToken) { spotifyApi.setAccessToken(accessToken); }

    batchedUris.map(async (uriBatch) => {
        await spotifyApi.addTracksToPlaylist(playlistId, uriBatch);
    });
}

