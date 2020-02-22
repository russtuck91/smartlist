import httpContext from 'express-http-context';
import { NotFound } from 'http-errors';
import { ObjectId } from 'mongodb';
import mongoist from 'mongoist';

import { Playlist } from '../../../shared/src/playlists/models';

import { User } from '../../src/core/session/models';
import { getCurrentUser } from './user-service';

const db = mongoist('mongodb://localhost:27017/smartify');


interface UPlaylist extends Playlist {
    userId: ObjectId;
}


export async function getPlaylists() {
    const currentUser: User = await getCurrentUser();

    const playlists = await db.playlists.find({ userId: currentUser._id });
    return playlists;
}

export async function getPlaylistById(id: string) {
    const currentUser: User = await getCurrentUser();

    const objId = new ObjectId(id);
    const playlist: Playlist|null = await db.playlists.findOne({ userId: currentUser._id, _id: objId });

    if (!playlist) {
        throw new NotFound();
    }

    return playlist;
}

export async function updatePlaylist(id: string, playlist: Playlist) {
    const currentUser: User = await getCurrentUser();

    const playlistUpdate: UPlaylist = { ...playlist, userId: currentUser._id };
    delete playlistUpdate._id;
    
    db.playlists.update(
        { _id: new ObjectId(id), userId: currentUser._id },
        { $set: playlistUpdate }
    );
}

export async function createPlaylist(playlist: Playlist) {
    const currentUser: User = await getCurrentUser();

    const newPlaylist: UPlaylist = { ...playlist, userId: currentUser._id };
    db.playlists.insertOne(newPlaylist);
}

export async function deletePlaylist(id: string) {
    const currentUser: User = await getCurrentUser();

    db.playlists.remove(
        { _id: new ObjectId(id), userId: currentUser._id },
        true
    );
}

