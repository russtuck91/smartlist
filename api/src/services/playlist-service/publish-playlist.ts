import { startTransaction } from '@sentry/node';

import { Playlist } from '../../../../shared';

import logger from '../../core/logger/logger';

import spotifyService from '../spotify-service/spotify-service';

import populateList from './populate-list';
import updatePlaylist from './update-playlist';


async function publishPlaylist(playlist: Playlist, accessToken: string) {
    logger.info(`>>>> Entering publishPlaylist(playlist.id = ${playlist.id}`);
    logger.info(`publishPlaylist token is: ${accessToken}`);
    const transaction = startTransaction({
        op: 'publishPlaylist',
        name: 'Publish Playlist',
    });

    const list = await populateList(playlist, accessToken);

    let spotifyPlaylistId = playlist.spotifyPlaylistId;
    const userHasPlaylist = spotifyPlaylistId && await spotifyService.userHasPlaylist(spotifyPlaylistId, accessToken);
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
    logger.info(`<<<< Exiting publishPlaylist(playlist.id = ${playlist.id}) after successful publish`);
}

export default publishPlaylist;
