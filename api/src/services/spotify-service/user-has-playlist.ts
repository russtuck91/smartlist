import logger from '../../core/logger/logger';
import maskToken from '../../core/logger/mask-token';

import getUsersPlaylists from './get-users-playlists';


async function userHasPlaylist(playlistId: string, accessToken: string): Promise<boolean> {
    logger.debug(`>>>> Entering userHasPlaylist(playlistId = ${playlistId} /// accessToken = ${maskToken(accessToken)}`);

    const usersPlaylists = await getUsersPlaylists(accessToken);

    if (!usersPlaylists) {
        logger.info('<<<< Exiting userHasPlaylist() after getting no playlist response for the user');
        logger.info(usersPlaylists);
        return false;
    }

    const result = !!(usersPlaylists.items.find((item) => item.id === playlistId));
    logger.debug(`<<<< Exiting userHasPlaylist() after getting user playlists. User had ${usersPlaylists.items.length} playlists and ${result ? 'DID' : 'DID NOT'} have this playlist.`);
    return result;
}

export default userHasPlaylist;
