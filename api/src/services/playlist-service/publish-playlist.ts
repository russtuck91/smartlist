import { Playlist } from '../../../../shared';

import logger from '../../core/logger/logger';

import spotifyService from '../spotify-service/spotify-service';

import populateListByRules from './populate-list-by-rules';
import updatePlaylist from './update-playlist';


async function publishPlaylist(playlist: Playlist, accessToken?: string) {
    logger.info(`>>>> Entering publishPlaylist(playlist._id = ${playlist._id}`);

    const list = await populateListByRules(playlist.rules, accessToken);
    logger.debug(`publishing playlist will have ${list.length} songs`);

    let spotifyPlaylistId = playlist.spotifyPlaylistId;
    if (spotifyPlaylistId && !playlist.deleted) {
        // Remove all tracks from playlist
        await spotifyService.removeTracksFromPlaylist(spotifyPlaylistId, accessToken);
    } else {
        const newPlaylist = await spotifyService.createNewPlaylist(playlist.name, playlist.userId);
        spotifyPlaylistId = newPlaylist.id;
    }

    // Add tracks to playlist
    await spotifyService.addTracksToPlaylist(spotifyPlaylistId, list, accessToken);

    // Save last published date, spotifyPlaylistId (in case it changed)
    const playlistUpdate: Partial<Playlist> = {
        spotifyPlaylistId: spotifyPlaylistId,
        lastPublished: new Date(),
        deleted: false,
    };
    await updatePlaylist(playlist._id, playlistUpdate);
}

export default publishPlaylist;
