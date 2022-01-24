import dbc from '../../dbc';

import CacheRepository from '../cache-repository';


const trackRepo = new CacheRepository<SpotifyApi.TrackObjectFull>(dbc, { name: 'cache.spotify.tracks' });

export default trackRepo;
