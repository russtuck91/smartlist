import moment from 'moment';
import { pool } from 'workerpool';

import { Playlist, sleep } from '../../../../shared';

import logger from '../../core/logger/logger';

import playlistRepo from '../../repositories/playlist-repository';
import batchProcess from '../../utils/batch-process';

import preValidatePublishPlaylist from './pre-validate-publish-playlist';


const publishPlaylistPool = pool(`${__dirname}/publish-playlist-process`, {
    workerType: 'process',
    maxWorkers: 1,
    forkOpts: {
        execArgv: ['--max-old-space-size=64', '-r', 'ts-node/register'],
    },
});

function sortPlaylists(playlists: Playlist[]) {
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
}

const BATCH_SIZE = 20;

async function publishAllPlaylists() {
    logger.info('>>>> Entering publishAllPlaylists()');

    await batchProcess<Playlist>({
        fetchBatch: (offset) =>
            playlistRepo.find({
                conditions: {
                    deleted: { $ne: true },
                    disabled: { $ne: true },
                },
                sort: { lastPublished: 1 },
                limit: BATCH_SIZE,
                skip: offset,
            }),
        processBatch: async (playlists) => {
            logger.info(`About to publish ${playlists.length} playlists...`);
            for (const p of playlists) {
                logger.info(`name = ${p.name} /// id = ${p.id} /// userId = ${p.userId}`);
            }

            for (const playlist of playlists) {
                try {
                    await preValidatePublishPlaylist(playlist);
                    await sleep(2000);
                } catch (e) {
                    logger.info(`Error publishing playlist ${playlist.id.toString()}`);
                    logger.error(JSON.stringify(e));
                }
            }
        },
        batchSize: BATCH_SIZE,
    });

    logger.info('<<<< Exiting publishAllPlaylists()');
}

export default publishAllPlaylists;
