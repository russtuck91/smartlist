import { ObjectId } from 'mongodb';

import { User } from '../../core/session/models';

import playlistRepo from '../../repositories/playlist-repository';

import { getCurrentUser } from '../user-service';


async function getPlaylists() {
    const currentUser: User = await getCurrentUser();

    const playlists = await playlistRepo.find({
        conditions: { userId: new ObjectId(currentUser.id) },
    });
    return playlists;
}

export default getPlaylists;
