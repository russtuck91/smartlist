import dbc from '../../dbc';

import CacheRepository from '../cache-repository';


const audioFeaturesRepo = new CacheRepository<SpotifyApi.AudioFeaturesObject>(dbc, { name: 'cache.spotify.audiofeatures' });

export default audioFeaturesRepo;
