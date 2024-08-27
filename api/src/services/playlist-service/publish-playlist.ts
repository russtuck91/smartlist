import { startTransaction } from '@sentry/node';

import { Playlist } from '../../../../shared';

import logger from '../../core/logger/logger';
import maskToken from '../../core/logger/mask-token';
import { doAndRetry } from '../../core/session/session-util';

import spotifyService from '../spotify-service/spotify-service';
import { getUserById } from '../user-service';

import populateList from './populate-list';
import updatePlaylist from './update-playlist';


async function publishPlaylist(playlist: Playlist) {
    logger.debug(`>>>> Entering publishPlaylist(playlist.id = ${playlist.id}`);
    const transaction = startTransaction({
        op: 'publishPlaylist',
        name: 'Publish Playlist',
    });

    try {
        const user = await getUserById(playlist.userId);
        await doAndRetry(async (accessToken) => {
            const list = await populateList(playlist, accessToken);

            let spotifyPlaylistId = playlist.spotifyPlaylistId;
            const userHasPlaylist = spotifyPlaylistId && await spotifyService.userHasPlaylist(spotifyPlaylistId, accessToken, !playlist.deleted);
            if (spotifyPlaylistId && userHasPlaylist) {
                // Remove all tracks from playlist
                await spotifyService.removeTracksFromPlaylist(spotifyPlaylistId, accessToken);
            } else {
                const newPlaylist = await spotifyService.createNewPlaylist(playlist.name, playlist.userId);
                spotifyPlaylistId = newPlaylist.id;
            }

            // Add tracks to playlist
            const trackUris = list.map((i) => i.uri);
            await spotifyService.addTracksToPlaylist(spotifyPlaylistId, trackUris, accessToken);

            const playlistDetailsUpdates = {
                name: playlist.name,
            };
            await spotifyService.updatePlaylistDetails(spotifyPlaylistId, playlistDetailsUpdates, accessToken);

            // Save last published date, spotifyPlaylistId (in case it changed)
            const playlistUpdate: Partial<Playlist> = {
                spotifyPlaylistId: spotifyPlaylistId,
                lastPublished: new Date(),
                deleted: false,
            };
            await updatePlaylist(playlist.id, playlistUpdate);

            transaction.finish();
            logger.info(`<<<< Exiting publishPlaylist after successful publish. playlist.id = ${playlist.id} /// accessToken = ${maskToken(accessToken)}`);
        }, user);
    } catch (e) {
        logger.error('Error in publishPlaylist()');
        logger.error(e);
        transaction.setStatus('internal_error');
        transaction.finish();
        throw e;
    }
}

export default publishPlaylist;
