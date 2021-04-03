import { ObjectId } from 'mongodb';

import { Playlist } from '../../../../shared';

import { db } from '../../core/db/db';


async function updatePlaylist(id: string, playlist: Partial<Playlist>) {
    delete playlist._id;
    delete playlist.userId;

    playlist.updatedAt = new Date();

    const result = await db.playlists.update(
        { _id: new ObjectId(id) },
        { $set: playlist },
    );

    return result;
}

export default updatePlaylist;
