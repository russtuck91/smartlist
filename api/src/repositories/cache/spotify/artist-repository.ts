import dbc from '../../dbc';

import CacheRepository from '../cache-repository';


const artistRepo = new CacheRepository<SpotifyApi.ArtistObjectFull>(dbc, { name: 'cache.spotify.artists' });

export default artistRepo;
