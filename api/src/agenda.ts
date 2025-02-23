import Agenda from 'agenda';
import { kebabCase } from 'lodash';

import { convertEnumToArray } from '../../shared';

import { MONGODB_URI } from './core/db/db';
import logger from './core/logger/logger';

import JobTypes from './jobs/job-types';
import { checkAllPlaylistsDeleted, publishAllPlaylists } from './services/playlist-service';


const connectionOpts = { db: { address: MONGODB_URI, collection: 'jobs' } };
export const agenda = new Agenda(connectionOpts);

const jobTypes = convertEnumToArray(JobTypes);
jobTypes.forEach((type) => {
    const module = require(`./jobs/${ kebabCase(type)}`);
    module.default(agenda);
});

export async function startAgenda() {
    logger.info('Starting agenda');
    await agenda.start();
    logger.info('Started agenda');

    if (process.env.NODE_ENV !== 'development') {
        // Do it the native way
        const PER_HOUR = 1000 * 60 * 60;
        setInterval(() => {
            publishAllPlaylists();
        }, PER_HOUR);

        // First run
        setTimeout(() => {
            publishAllPlaylists();
        }, 1000 * 60);
        // await agenda.now(JobTypes.playlistPublishing);

        const PER_TWO_HOURS = 2 * 1000 * 60 * 60;
        setInterval(() => checkAllPlaylistsDeleted(), PER_TWO_HOURS);
    }
}

async function graceful() {
    logger.info('in graceful shutdown');
    await agenda.stop();
    process.exit(0);
}

process.on('SIGTERM', graceful);
process.on('SIGINT', graceful);

