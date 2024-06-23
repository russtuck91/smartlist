import { chunk, truncate, uniq } from 'lodash';

import logger from '../../core/logger/logger';

import doAndWaitForRateLimit from './do-and-wait-for-rate-limit';
import initSpotifyApi from './init-spotify-api';


async function getAlbums(albumIds: string[], accessToken: string|undefined): Promise<SpotifyApi.AlbumObjectFull[]> {
    logger.debug(`>>>> Entering getAlbums(albumIds = ${truncate(albumIds.join(','))}`);

    const spotifyApi = await initSpotifyApi(accessToken);

    // Spotify API requires batches of 20 max
    const batchSize = 20;
    const batchedIds = chunk(uniq(albumIds), batchSize);

    let albumsResponse: (SpotifyApi.AlbumObjectFull|null)[] = [];
    for (const batch of batchedIds) {
        await doAndWaitForRateLimit(async () => {
            const albumResponse = await spotifyApi.getAlbums(batch);
            albumsResponse = albumsResponse.concat(albumResponse.body.albums);
        });
    }

    // Despite documentation, album can sometimes be null
    const albums = albumsResponse.filter((a): a is SpotifyApi.AlbumObjectFull => !!a);
    return albums;
}

export default getAlbums;
