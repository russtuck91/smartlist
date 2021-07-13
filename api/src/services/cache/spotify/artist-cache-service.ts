import artistRepo from '../../../repositories/cache/spotify/artist-repository';
import spotifyService from '../../spotify-service/spotify-service';

import DbCacheService from '../db-cache-service';
import MemCacheService from '../mem-cache-service';


const artistDbCacheService = new DbCacheService(artistRepo, spotifyService.getArtists);

const artistCacheService = new MemCacheService(artistDbCacheService.getItems);

export default artistCacheService;
