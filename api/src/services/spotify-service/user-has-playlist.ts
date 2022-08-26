import logger from '../../core/logger/logger';

import getUsersPlaylists from './get-users-playlists';


async function userHasPlaylist(userId: string, playlistId: string, accessToken: string|undefined): Promise<boolean> {
    logger.info(`>>>> Entering userHasPlaylist(playlistId = ${playlistId})`);

    const usersPlaylists = await getUsersPlaylists(userId, accessToken);

    if (!usersPlaylists) {
        logger.debug('<<<< Exiting userHasPlaylist() after getting no playlists for the user');
        logger.debug(usersPlaylists);
        return false;
    }

    const result = !!(usersPlaylists.items.find((item) => item.id === playlistId));
    logger.debug(`<<<< Exiting userHasPlaylist() after getting user playlists. User had ${usersPlaylists.items.length} playlists and ${result ? 'DID' : 'DID NOT'} have this playlist.`);
    return result;
}

export default userHasPlaylist;
