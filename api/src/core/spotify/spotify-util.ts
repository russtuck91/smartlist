import { spotifyApi } from './spotify-api';


interface SpResponse<T> {
    body: T;
    headers: Record<string, string>;
    statusCode: number;
}


export const spotifyUtil = {
    getFullPagedResults: getFullPagedResults,
    getFullMySavedTracks: getFullMySavedTracks
};


async function getFullPagedResults(accessToken: string, fn: Function): Promise<SpotifyApi.PagingObject<any>|undefined> {
    console.log('in getFullPagedResults');
    let result: SpotifyApi.PagingObject<any>|undefined;
    let offset = 0;
    const batchSize = 50;

    // while number fetched is less than total reported, send request
    while (!result || result.total > result.items.length) {
        const response: SpResponse<SpotifyApi.PagingObject<any>> = await fn({ limit: batchSize, offset: offset });

        if (!result) {
            result = response.body;
        } else {
            // take list from response and add it to result
            result.items.push(...response.body.items);
        }

        offset += batchSize;
    }

    return result;
}

async function getFullMySavedTracks(accessToken: string): Promise<SpotifyApi.PagingObject<any>|undefined> {
    try {
        console.log('in getFullMySavedTracks');
        let result: SpotifyApi.PagingObject<any>|undefined;
        let offset = 0;
        const batchSize = 50;

        spotifyApi.setAccessToken(accessToken);

        // while number fetched is less than total reported, send request
        while (!result || result.total > result.items.length) {
            const response: SpResponse<SpotifyApi.PagingObject<any>> = await spotifyApi.getMySavedTracks({ limit: batchSize, offset: offset });

            if (!result) {
                result = response.body;
            } else {
                // take list from response and add it to result
                result.items.push(...response.body.items);
            }

            offset += batchSize;
        }

        return result;
    } catch (e) {
        // throw new Error(e);
        // return;
        throw e;
    }
}

