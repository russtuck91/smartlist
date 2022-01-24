import trackRepo from '../../../repositories/cache/spotify/track-repository';
import spotifyService from '../../spotify-service/spotify-service';

import DbCacheService from '../db-cache-service';


const trackCacheService = new DbCacheService(trackRepo, spotifyService.getTracksById);

export default trackCacheService;
