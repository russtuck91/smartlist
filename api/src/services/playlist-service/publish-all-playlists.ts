import moment from 'moment';

import logger from '../../core/logger/logger';
import { doAndRetry } from '../../core/session/session-util';

import playlistRepo from '../../repositories/playlist-repository';

import { getUserById } from '../user-service';

import preValidatePublishPlaylist from './pre-validate-publish-playlist';


async function publishAllPlaylists() {
    logger.info('>>>> Entering publishAllPlaylists()');

    const playlists = await playlistRepo.find({
        conditions: {},
    });
    playlists.sort((a, b) => {
        const deleteCompare = Number(a.deleted) - Number(b.deleted);
        if (deleteCompare) return deleteCompare;
        if (!a.deleted && !b.deleted) {
            return moment(a.lastPublished).diff( moment(b.lastPublished) );
        }
        if (a.deleted && b.deleted) {
            return moment(b.lastPublished).diff( moment(a.lastPublished) );
        }
        return 0;
    });
    if (process.env.PLAYLIST_PUBLISH_LIMIT) {
        playlists.splice(process.env.PLAYLIST_PUBLISH_LIMIT as any);
    }

    logger.info(`About to publish ${playlists.length} playlists...`);
    playlists.map((p) =>
        logger.info(`name = ${p.name} /// id = ${p.id} /// userId = ${p.userId}`),
    );

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
