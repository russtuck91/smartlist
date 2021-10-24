import albumCacheService from './album-cache-service';
import artistCacheService from './artist-cache-service';
import audioFeaturesCacheService from './audio-features-cache-service';
import searchForGenre from './search-for-genre';
import userSavedTracksCacheService from './user-saved-tracks-cache-service';


class SpotifyCacheService {
    getFullMySavedTracks = userSavedTracksCacheService.getFullList;

    getAlbums = albumCacheService.getItems;
    getArtists = artistCacheService.getItems;
    getAudioFeatures = audioFeaturesCacheService.getItems;

    searchForGenre = searchForGenre;
}

const spotifyCacheService = new SpotifyCacheService();
export default spotifyCacheService;
