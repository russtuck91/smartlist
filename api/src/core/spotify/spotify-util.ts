import httpContext from 'express-http-context';

import { PlaylistRule } from '../../../../shared/playlists/models';
import { spotifyApi } from './spotify-api';


interface SpResponse<T> {
    body: T;
    headers: Record<string, string>;
    statusCode: number;
}


export const spotifyUtil = {
    getFullMySavedTracks: getFullMySavedTracks,
    getFullSearchResults: getFullSearchResults
};


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

async function getFullMySavedTracks(): Promise<SpotifyApi.PagingObject<any>|undefined> {
    console.log('in getFullMySavedTracks');
    const accessToken = httpContext.get('accessToken');

    spotifyApi.setAccessToken(accessToken);
    return getFullPagedResults(async (options) => {
        const apiResponse: SpResponse<SpotifyApi.PagingObject<any>> = await spotifyApi.getMySavedTracks(options);

        return apiResponse.body;
    });
}

async function getFullSearchResults(rules: PlaylistRule[]) {
    console.log('in getFullSearchResults');
    const accessToken = httpContext.get('accessToken');

    spotifyApi.setAccessToken(accessToken);
    const dummySearch = 'artist:"Jukebox the Ghost"';
    return getFullPagedResults(async (options) => {
        const apiResponse: SpResponse<SpotifyApi.SearchResponse> = await spotifyApi.search(dummySearch, [ 'track' ], options);

        return apiResponse.body.tracks;
    });
}

