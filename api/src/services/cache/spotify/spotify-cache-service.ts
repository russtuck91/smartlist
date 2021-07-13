import albumCacheService from './album-cache-service';
import artistCacheService from './artist-cache-service';
import audioFeaturesCacheService from './audio-features-cache-service';


class SpotifyCacheService {
    getAlbums = albumCacheService.getItems;
    getArtists = artistCacheService.getItems;
    getAudioFeatures = audioFeaturesCacheService.getItems;
}

const spotifyCacheService = new SpotifyCacheService();
export default spotifyCacheService;
