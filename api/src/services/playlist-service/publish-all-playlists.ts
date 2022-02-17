import logger from '../../core/logger/logger';
import { doAndRetry } from '../../core/session/session-util';

import playlistRepo from '../../repositories/playlist-repository';

import { getUserById } from '../user-service';

import preValidatePublishPlaylist from './pre-validate-publish-playlist';


async function publishAllPlaylists() {
    logger.info('>>>> Entering publishAllPlaylists()');

    const playlists = await playlistRepo.find({
        conditions: {},
        sort: {
            lastPublished: 1,
        },
    });
    for (const playlist of playlists) {
        try {
            const user = await getUserById(playlist.userId);
            if (user) {
                await doAndRetry(async (accessToken: string) => {
                    await preValidatePublishPlaylist(playlist, accessToken);
                }, user);
            }
        } catch (e) {
            logger.info(`error publishing playlist ${playlist.id.toString()}`);
            logger.error(JSON.stringify(e));
        }
    }
}

export default publishAllPlaylists;
