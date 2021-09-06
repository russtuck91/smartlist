import { Playlist } from '../../../../shared';

import logger from '../../core/logger/logger';

import spotifyService from '../spotify-service/spotify-service';

import publishPlaylist from './publish-playlist';
import updatePlaylist from './update-playlist';


async function preValidatePublishPlaylist(playlist: Playlist, accessToken: string|undefined) {
    logger.info(`>>>> Entering preValidatePublishPlaylist(playlist.id = ${playlist.id})`);

    // User has deleted playlist. Do not publish on intervals, require user to re-publish manually
    if (playlist.deleted) {
        return;
    }

    // Has been published before
    if (playlist.spotifyPlaylistId) {
        const userHasPlaylist = await spotifyService.userHasPlaylist(playlist.userId.toString(), playlist.spotifyPlaylistId, accessToken);

        // User has deleted playlist since last publish
        if (!userHasPlaylist) {
            await updatePlaylist(playlist.id, { deleted: true });
            return;
        }
    }

    return publishPlaylist(playlist, accessToken);
}

export default preValidatePublishPlaylist;
