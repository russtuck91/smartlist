import { Artist } from '../../../core/shared-models';

import dbc from '../../dbc';

import CacheRepository from '../cache-repository';


const artistRepo = new CacheRepository<Artist>(dbc, { name: 'cache.spotify.artists' });

export default artistRepo;
