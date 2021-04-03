import Agenda from 'agenda';

import logger from '../core/logger/logger';

import { publishAllPlaylists } from '../services/playlist-service';

export default function(agenda: Agenda) {
    agenda.define('playlistPublishing', async (job) => {
        logger.info('>>>> Entering playlistPublishing job');

        try {
            await publishAllPlaylists();
        } catch (e) {
            logger.error('error in playlistPublishing', e);
        }
    });
}
