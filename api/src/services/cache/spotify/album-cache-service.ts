import albumRepo from '../../../repositories/cache/spotify/album-repository';
import spotifyService from '../../spotify-service/spotify-service';

import DbCacheService from '../db-cache-service';
import MemCacheService from '../mem-cache-service';


const albumDbCacheService = new DbCacheService(albumRepo, spotifyService.getAlbums);

const albumCacheService = new MemCacheService(albumDbCacheService.getItems);

export default albumCacheService;
