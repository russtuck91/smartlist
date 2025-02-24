import moment from 'moment';
import { pool } from 'workerpool';

import logger from '../../core/logger/logger';

import playlistRepo from '../../repositories/playlist-repository';


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

    await Promise.all(playlists.map((playlist) => {
        return publishPlaylistPool.exec('publishPlaylistProcess', [playlist]);
    }));

    publishPlaylistPool.terminate();
    logger.info('<<<< Exiting publishAllPlaylists()');
}

export default publishAllPlaylists;
