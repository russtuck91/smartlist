import httpContext from 'express-http-context';
import { ObjectId } from 'mongodb';
import mongoist from 'mongoist';

import { Playlist } from '../../../shared/src/playlists/models';

import { User } from '../../src/core/session/models';

const db = mongoist('mongodb://localhost:27017/smartify');


interface UPlaylist extends Playlist {
    userId: ObjectId;
}


export async function getPlaylists() {
    const accessToken = httpContext.get('accessToken');
    const currentUser: User|null = await db.users.findOne({ accessToken: accessToken });

    if (!currentUser) { return; }

    const playlists = await db.playlists.find({ userId: currentUser._id });
    return playlists;
}

export async function createPlaylist(playlist: Playlist) {
    const accessToken = httpContext.get('accessToken');
    const currentUser: User|null = await db.users.findOne({ accessToken: accessToken });

    if (!currentUser) { return; }

    const newPlaylist: UPlaylist = { ...playlist, userId: currentUser._id };
    db.playlists.insertOne(newPlaylist);
}

