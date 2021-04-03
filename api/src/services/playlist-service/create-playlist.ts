import { Playlist } from '../../../../shared';

import { db } from '../../core/db/db';
import { User } from '../../core/session/models';

import { getCurrentUser } from '../user-service';


async function createPlaylist(playlist: Playlist) {
    const currentUser: User = await getCurrentUser();

    const now = new Date();
    const newPlaylist: Playlist = {
        ...playlist,
        userId: currentUser._id,
        createdAt: now,
        updatedAt: now,
    };
    const result = await db.playlists.insertOne(newPlaylist);

    return result;
}

export default createPlaylist;
