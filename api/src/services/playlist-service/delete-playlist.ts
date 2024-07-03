import { ObjectId } from 'mongodb';

import { PlaylistDeleteOptions } from '../../../../shared';

import { doAndRetry } from '../../core/session/session-util';

import playlistRepo from '../../repositories/playlist-repository';

import spotifyService from '../spotify-service/spotify-service';
import { getCurrentUser } from '../user-service';

import getPlaylistById from './get-playlist-by-id';


async function deletePlaylist(id: string, options: PlaylistDeleteOptions) {
    const currentUser = await getCurrentUser();

    if (options.deleteSpotifyPlaylist) {
        await doAndRetry(async (accessToken) => {
            const playlist = await getPlaylistById(id);
            if (playlist.spotifyPlaylistId) {
                await spotifyService.unfollowPlaylist(playlist.spotifyPlaylistId, accessToken);
            }
        }, currentUser);
    }

    await playlistRepo.deleteOne({ _id: new ObjectId(id), userId: new ObjectId(currentUser.id) });
}

export default deletePlaylist;
