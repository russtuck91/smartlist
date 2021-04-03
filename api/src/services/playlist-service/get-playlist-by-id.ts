import { NotFound } from 'http-errors';
import { ObjectId } from 'mongodb';

import { Playlist } from '../../../../shared';

import { db } from '../../core/db/db';
import { User } from '../../core/session/models';

import { getCurrentUser } from '../user-service';


async function getPlaylistById(id: string) {
    const currentUser: User = await getCurrentUser();

    const objId = new ObjectId(id);
    const playlist: Playlist|null = await db.playlists.findOne({ userId: currentUser._id, _id: objId });

    if (!playlist) {
        throw new NotFound();
    }

    return playlist;
}

export default getPlaylistById;
