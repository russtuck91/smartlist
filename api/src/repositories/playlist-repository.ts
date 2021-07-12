import { MongoRepository } from 'mongtype';

import { Playlist } from '../../../shared';

import dbc from './dbc';


const playlistRepo = new MongoRepository<Playlist>(dbc, {
    name: 'playlists',
    eventOpts: { noClone: true },
});

export default playlistRepo;
