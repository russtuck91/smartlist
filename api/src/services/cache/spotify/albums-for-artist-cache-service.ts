import { AlbumsForArtist } from '../../../core/shared-models';

import albumsForArtistRepo from '../../../repositories/cache/spotify/albums-for-artists-repository';
import spotifyService from '../../spotify-service/spotify-service';

import DbCacheService from '../db-cache-service';


const albumsForArtistDbCacheService = new DbCacheService(albumsForArtistRepo, async (...args) => {
    const [ids, ...restArgs] = args;
    const id = ids[0]!;
    const sourceData = await spotifyService.getAlbumsForArtist(id, ...restArgs);
    const mappedResult: AlbumsForArtist = {
        id: id,
        albumIds: sourceData.map((albumObject) => albumObject.id),
    };
    return [mappedResult];
});

const albumsForArtistCacheService = albumsForArtistDbCacheService;

export default albumsForArtistCacheService;
