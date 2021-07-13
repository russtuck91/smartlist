import audioFeaturesRepo from '../../../repositories/cache/spotify/audio-features-repository';
import spotifyService from '../../spotify-service/spotify-service';

import DbCacheService from '../db-cache-service';
import MemCacheService from '../mem-cache-service';


const audioFeaturesDbCacheService = new DbCacheService(audioFeaturesRepo, spotifyService.getAudioFeatures);

const audioFeaturesCacheService = new MemCacheService(audioFeaturesDbCacheService.getItems);

export default audioFeaturesCacheService;
