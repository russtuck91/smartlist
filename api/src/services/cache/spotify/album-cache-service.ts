import { mapToAlbum } from '../../../mappers/spotify/album-object-full-mapper';
import albumRepo from '../../../repositories/cache/spotify/album-repository';
import spotifyService from '../../spotify-service/spotify-service';

import DbCacheService from '../db-cache-service';
import MemCacheService from '../mem-cache-service';


const albumDbCacheService = new DbCacheService(albumRepo, async (...args) => {
    return (await spotifyService.getAlbums(...args)).map(mapToAlbum);
});

const albumCacheService = new MemCacheService(albumDbCacheService.getItems);

export default albumCacheService;
