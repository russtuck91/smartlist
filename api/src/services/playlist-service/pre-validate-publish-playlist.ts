import { Playlist } from '../../../../shared';

import logger from '../../core/logger/logger';

import { getUserById } from '../user-service';

import publishPlaylist from './publish-playlist';


async function preValidatePublishPlaylist(playlist: Playlist) {
    logger.debug(`>>>> Entering preValidatePublishPlaylist(playlist.id = ${playlist.id}`);

    if (playlist.disabled) {
        logger.info('<<<< Exiting preValidatePublishPlaylist() after finding playlist is marked disabled');
        return;
    }

    if (playlist.deleted) {
        logger.debug('<<<< Exiting preValidatePublishPlaylist() after finding playlist is marked deleted');
        return;
    }

    const user = await getUserById(playlist.userId);
    if (user.spotifyPermissionError) {
        logger.debug('<<<< Exiting preValidatePublishPlaylist() after finding user has permission error');
        return;
    }

    return publishPlaylist(playlist);
}

export default preValidatePublishPlaylist;
