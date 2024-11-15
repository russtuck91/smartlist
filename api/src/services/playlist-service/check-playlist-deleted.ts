import { Playlist } from '../../../../shared';

import logger from '../../core/logger/logger';
import { doAndRetry } from '../../core/session/session-util';

import spotifyService from '../spotify-service/spotify-service';
import { getUserById } from '../user-service';

import sendPlaylistDeletedNotification from './send-playlist-deleted-notification';
import updatePlaylist from './update-playlist';


async function checkPlaylistDeleted(playlist: Playlist) {
    try {
        const user = await getUserById(playlist.userId);
        if (user.spotifyPermissionError) {
            logger.debug('>>>> Exiting checkPlaylistDeleted() after finding user has permission error');
            return;
        }
        await doAndRetry(async (accessToken) => {
            // Has not been published before
            if (!playlist.spotifyPlaylistId) {
                return;
            }

            const userHasPlaylist = await spotifyService.userHasPlaylist(playlist.spotifyPlaylistId, accessToken, !playlist.deleted);

            // Was previously not deleted but now found to be deleted
            if (!playlist.deleted && !userHasPlaylist) {
                logger.info(`Playlist ${playlist.id} was found to be deleted. userHasPlaylist = ${userHasPlaylist}`);
                await updatePlaylist(playlist.id, { deleted: true });
                sendPlaylistDeletedNotification(playlist);
            }

            // Was previously deleted but now found to be not deleted
            if (playlist.deleted && userHasPlaylist) {
                await updatePlaylist(playlist.id, { deleted: false });
            }
        }, user);
    } catch (e) {
        logger.info(`Error in checkPlaylistDeleted ${playlist.id.toString()}`);
        logger.error(e);
    }
}

export default checkPlaylistDeleted;
