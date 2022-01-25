import trackRepo from '../../../repositories/cache/spotify/track-repository';
import spotifyService from '../../spotify-service/spotify-service';

import DbCacheService from '../db-cache-service';
import MemCacheService from '../mem-cache-service';


const trackDbCacheService = new DbCacheService(trackRepo, spotifyService.getTracksById);

const trackCacheService = new MemCacheService(trackDbCacheService.getItems);

trackCacheService.setItems = trackDbCacheService.setItems;

export default trackCacheService;
