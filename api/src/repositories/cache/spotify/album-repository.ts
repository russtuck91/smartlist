import { Album } from '../../../core/shared-models';

import dbc from '../../dbc';

import CacheRepository from '../cache-repository';


const albumRepo = new CacheRepository<Album>(dbc, { name: 'cache.spotify.albums' });

export default albumRepo;
