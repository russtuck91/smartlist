import Agenda from 'agenda';

import logger from '../core/logger/logger';

import { publishAllPlaylists } from '../services/playlist-service';

import JobTypes from './job-types';

export default function(agenda: Agenda) {
    agenda.define(JobTypes.playlistPublishing, async (job) => {
        logger.info('>>>> Entering playlistPublishing job');

        try {
            await publishAllPlaylists();
        } catch (e) {
            logger.error(`error in playlistPublishing ${JSON.stringify(e)}`);
        }
    });
}
