import { mapToArtist } from '../../../mappers/spotify/artist-object-full-mapper';
import artistRepo from '../../../repositories/cache/spotify/artist-repository';
import spotifyService from '../../spotify-service/spotify-service';

import DbCacheService from '../db-cache-service';
import MemCacheService from '../mem-cache-service';


const artistDbCacheService = new DbCacheService(artistRepo, async (...args) => {
    return (await spotifyService.getArtists(...args)).map(mapToArtist);
});

const artistCacheService = new MemCacheService(artistDbCacheService.getItems);

export default artistCacheService;
