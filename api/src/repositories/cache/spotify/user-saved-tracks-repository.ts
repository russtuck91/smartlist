import dbc from '../../dbc';

import ChronoCacheRepository from '../chrono-cache-repository';


const userSavedTracksRepo = new ChronoCacheRepository(dbc, { name: 'cache.spotify.usersavedtracks' });

export default userSavedTracksRepo;
