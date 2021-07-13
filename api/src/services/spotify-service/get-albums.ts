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

    let albums: SpotifyApi.AlbumObjectFull[] = [];
    for (const batch of batchedIds) {
        await doAndWaitForRateLimit(async () => {
            const albumResponse = await spotifyApi.getAlbums(batch);
            albums = albums.concat(albumResponse.body.albums);
        });
    }

    return albums;
}

export default getAlbums;
