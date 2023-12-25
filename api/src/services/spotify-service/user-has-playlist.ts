import logger from '../../core/logger/logger';

import getUsersPlaylists from './get-users-playlists';


async function userHasPlaylist(playlistId: string, accessToken: string|undefined): Promise<boolean> {
    logger.info(`>>>> Entering userHasPlaylist(playlistId = ${playlistId})`);

    const usersPlaylists = await getUsersPlaylists(accessToken);

    if (!usersPlaylists) {
        logger.info('<<<< Exiting userHasPlaylist() after getting no playlists for the user');
        logger.info(usersPlaylists);
        return false;
    }

    const result = !!(usersPlaylists.items.find((item) => item.id === playlistId));
    logger.info(`<<<< Exiting userHasPlaylist() after getting user playlists. User had ${usersPlaylists.items.length} playlists and ${result ? 'DID' : 'DID NOT'} have this playlist.`);
    return result;
}

export default userHasPlaylist;
