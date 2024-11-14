import moment from 'moment';

import logger from '../../core/logger/logger';

import playlistRepo from '../../repositories/playlist-repository';

import checkPlaylistDeleted from './check-playlist-deleted';


async function checkAllPlaylistsDeleted() {
    logger.info('>>>> Entering checkAllPlaylistsDeleted()');

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

    for (const playlist of playlists) {
        await checkPlaylistDeleted(playlist);
    }

    logger.info('<<<< Exiting checkAllPlaylistsDeleted()');
}

export default checkAllPlaylistsDeleted;

