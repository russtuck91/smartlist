import Agenda from 'agenda';
import { kebabCase } from 'lodash';

import { convertEnumToArray } from '../../shared';

import { MONGODB_URI } from './core/db/db';
import logger from './core/logger/logger';

const connectionOpts = { db: { address: MONGODB_URI, collection: 'jobs' } };

export const agenda = new Agenda(connectionOpts);

export enum JobTypes {
    playlistPublishing = 'playlistPublishing',
    fetchResourcesForUser = 'fetchResourcesForUser',
}
const jobTypes = convertEnumToArray(JobTypes);

jobTypes.forEach((type) => {
    const module = require(`./jobs/${ kebabCase(type)}`);
    module.default(agenda);
});

if (jobTypes.length) {
    (async () => {
        logger.info('Starting agenda');
        await agenda.start();
        logger.info('Started agenda');

        await agenda.every('3 hours', 'playlistPublishing');

        // await agenda.now('playlistPublishing');
    })();
}

async function graceful() {
    logger.info('in graceful shutdown');
    await agenda.stop();
    process.exit(0);
}

process.on('SIGTERM', graceful);
process.on('SIGINT', graceful);

