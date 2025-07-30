import { Playlist } from '../../../../shared';

import logger from '../../core/logger/logger';

import playlistRepo from '../../repositories/playlist-repository';
import batchProcess from '../../utils/batch-process';

import checkPlaylistDeleted from './check-playlist-deleted';


const BATCH_SIZE = 20;

async function checkAllPlaylistsDeleted() {
    logger.info('>>>> Entering checkAllPlaylistsDeleted()');

    await batchProcess<Playlist>({
        fetchBatch: (offset) => {
            return playlistRepo.find({
                conditions: {},
                sort: {
                    lastPublished: 1,
                },
                limit: BATCH_SIZE,
                skip: offset,
            });
        },
        processBatch: async (playlists) => {
            for (const playlist of playlists) {
                await checkPlaylistDeleted(playlist);
            }
        },
        batchSize: BATCH_SIZE,
    });

    logger.info('<<<< Exiting checkAllPlaylistsDeleted()');
}

export default checkAllPlaylistsDeleted;

