import { Playlist } from '../../../../shared';

import { db } from '../../core/db/db';
import logger from '../../core/logger/logger';
import { doAndRetry } from '../../core/session/session-util';

import { getUserById } from '../user-service';

import preValidatePublishPlaylist from './pre-validate-publish-playlist';


async function publishAllPlaylists() {
    logger.info('>>>> Entering publishAllPlaylists()');

    const playlists: Playlist[] = await db.playlists.find();
    for (const playlist of playlists) {
        try {
            const user = await getUserById(playlist.userId);
            if (user) {
                await doAndRetry(async (accessToken: string) => {
                    await preValidatePublishPlaylist(playlist, accessToken);
                }, user);
            }
        } catch (e) {
            logger.info('error publishing playlist', playlist._id.toString());
            logger.error(e);
        }
    }
}

export default publishAllPlaylists;
