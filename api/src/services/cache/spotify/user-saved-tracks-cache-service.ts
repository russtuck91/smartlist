import userSavedTracksRepo from '../../../repositories/cache/spotify/user-saved-tracks-repository';
import spotifyService from '../../spotify-service/spotify-service';

import ChronoDbCacheService from '../chrono-db-cache-service';


const userSavedTracksCacheService = new ChronoDbCacheService(userSavedTracksRepo, spotifyService.getFullMySavedTracks);

export default userSavedTracksCacheService;
