import { Playlist } from '../../../../shared';

import logger from '../../core/logger/logger';

import spotifyService from '../spotify-service/spotify-service';

import publishPlaylist from './publish-playlist';
import updatePlaylist from './update-playlist';


async function preValidatePublishPlaylist(playlist: Playlist, accessToken: string) {
    logger.info(`>>>> Entering preValidatePublishPlaylist(playlist.id = ${playlist.id})`);

    // Has been published before
    if (playlist.spotifyPlaylistId) {
        const userHasPlaylist = await spotifyService.userHasPlaylist(playlist.spotifyPlaylistId, accessToken);

        // Was previously not deleted but now found to be deleted
        // User has deleted playlist since last publish
        if (!playlist.deleted && !userHasPlaylist) {
            await updatePlaylist(playlist.id, { deleted: true });
        }

        // Was previously deleted but now found to be not deleted
        if (playlist.deleted && userHasPlaylist) {
            await updatePlaylist(playlist.id, { deleted: false });
        }

        if (!userHasPlaylist) {
            return;
        }
    }

    return publishPlaylist(playlist, accessToken);
}

export default preValidatePublishPlaylist;
