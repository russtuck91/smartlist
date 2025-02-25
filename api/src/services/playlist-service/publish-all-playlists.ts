import moment from 'moment';
import { pool } from 'workerpool';

import { sleep } from '../../../../shared';

import logger from '../../core/logger/logger';

import playlistRepo from '../../repositories/playlist-repository';

import preValidatePublishPlaylist from './pre-validate-publish-playlist';


const publishPlaylistPool = pool(`${__dirname}/publish-playlist-process`, {
    workerType: 'process',
    maxWorkers: 1,
    forkOpts: {
        execArgv: ['--max-old-space-size=64', '-r', 'ts-node/register'],
    },
});

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

    if (process.env.ENABLE_PUBLISH_POOL) {
        await Promise.all(playlists.map((playlist) => {
            return publishPlaylistPool.exec('publishPlaylistProcess', [playlist]);
        }));

        publishPlaylistPool.terminate();
    } else {
        for (const playlist of playlists) {
            try {
                await preValidatePublishPlaylist(playlist);
                // Wait to reduce memory consumption
                await sleep(2000);
            } catch (e) {
                logger.info(`error publishing playlist ${playlist.id.toString()}`);
                logger.error(JSON.stringify(e));
            }
        }
    }
    logger.info('<<<< Exiting publishAllPlaylists()');
}

export default publishAllPlaylists;
