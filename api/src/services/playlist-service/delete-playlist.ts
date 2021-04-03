import { ObjectId } from 'mongodb';

import { PlaylistDeleteOptions } from '../../../../shared';

import { db } from '../../core/db/db';
import { User } from '../../core/session/models';
import { doAndRetry } from '../../core/session/session-util';

import spotifyService from '../spotify-service/spotify-service';
import { getCurrentUser } from '../user-service';

import getPlaylistById from './get-playlist-by-id';


async function deletePlaylist(id: string, options: PlaylistDeleteOptions) {
    const currentUser: User = await getCurrentUser();

    if (options.deleteSpotifyPlaylist) {
        doAndRetry(async (accessToken) => {
            const playlist = await getPlaylistById(id);
            if (playlist.spotifyPlaylistId) {
                await spotifyService.unfollowPlaylist(playlist.spotifyPlaylistId, accessToken);
            }
        }, currentUser);
    }

    db.playlists.remove(
        { _id: new ObjectId(id), userId: currentUser._id },
        true,
    );
}

export default deletePlaylist;
