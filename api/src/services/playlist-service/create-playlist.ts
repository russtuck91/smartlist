import { ObjectId } from 'mongodb';

import { Playlist } from '../../../../shared';

import playlistRepo from '../../repositories/playlist-repository';

import { getCurrentUser } from '../user-service';


async function createPlaylist(playlist: Playlist) {
    const currentUser = await getCurrentUser();

    const now = new Date();
    const newPlaylist: Playlist = {
        ...playlist,
        userId: new ObjectId(currentUser.id),
        createdAt: now,
        updatedAt: now,
    };
    const result = await playlistRepo.create(newPlaylist);

    return result;
}

export default createPlaylist;
