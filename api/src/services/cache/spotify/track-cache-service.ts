import { mapToTrack } from '../../../mappers/spotify/track-object-full-mapper';
import trackRepo from '../../../repositories/cache/spotify/track-repository';
import spotifyService from '../../spotify-service/spotify-service';

import DbCacheService from '../db-cache-service';
import MemCacheService from '../mem-cache-service';


const trackDbCacheService = new DbCacheService(trackRepo, async (...args) => {
    return (await spotifyService.getTracksById(...args)).map(mapToTrack);
});

const trackCacheService = new MemCacheService(trackDbCacheService.getItems);

trackCacheService.setItems = trackDbCacheService.setItems;

export default trackCacheService;
