import { Track } from '../../../../../shared';

import dbc from '../../dbc';

import CacheRepository from '../cache-repository';


const trackRepo = new CacheRepository<Track>(dbc, { name: 'cache.spotify.tracks' });

export default trackRepo;
