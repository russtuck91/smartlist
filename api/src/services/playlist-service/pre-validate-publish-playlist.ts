import { Playlist } from '../../../../shared';

import logger from '../../core/logger/logger';

import spotifyService from '../spotify-service/spotify-service';
import { getUserById } from '../user-service';

import publishPlaylist from './publish-playlist';
import updatePlaylist from './update-playlist';


async function preValidatePublishPlaylist(playlist: Playlist, accessToken: string) {
    logger.info(`>>>> Entering preValidatePublishPlaylist(playlist.id = ${playlist.id})`);

    if (playlist.disabled) {
        logger.debug('<<<< Exiting preValidatePublishPlaylist() after finding playlist is marked disabled');
        return;
    }

    const user = await getUserById(playlist.userId);
    if (user.spotifyPermissionError) {
        logger.debug('<<<< Exiting preValidatePublishPlaylist() after finding user has permission error');
        return;
    }

    // Has been published before
    if (playlist.spotifyPlaylistId) {
        const userHasPlaylist = await spotifyService.userHasPlaylist(playlist.spotifyPlaylistId, accessToken);
        logger.info(`Does user has playlist of id ${playlist.id} ... ${userHasPlaylist}`);

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
