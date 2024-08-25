import { AlbumsForArtist } from '../../../core/shared-models';

import dbc from '../../dbc';

import CacheRepository from '../cache-repository';


const albumsForArtistRepo = new CacheRepository<AlbumsForArtist>(dbc, {
    name: 'cache.spotify.albumsForArtist',
});

export default albumsForArtistRepo;
