import dbc from '../../dbc';

import CacheRepository from '../cache-repository';


const albumRepo = new CacheRepository<SpotifyApi.AlbumObjectFull>(dbc, { name: 'cache.spotify.albums' });

export default albumRepo;
