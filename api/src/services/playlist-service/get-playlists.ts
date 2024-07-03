import { ObjectId } from 'mongodb';

import playlistRepo from '../../repositories/playlist-repository';

import { getCurrentUser } from '../user-service';


async function getPlaylists() {
    const currentUser = await getCurrentUser();

    const playlists = await playlistRepo.find({
        conditions: { userId: new ObjectId(currentUser.id) },
    });
    return playlists;
}

export default getPlaylists;
