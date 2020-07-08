import Agenda from 'agenda';
import { kebabCase } from 'lodash';

import { MONGODB_URI } from './core/db/db';

const connectionOpts = { db: { address: MONGODB_URI, collection: 'jobs' } };

export const agenda = new Agenda(connectionOpts);

const jobTypes = ['playlistPublishing'];

jobTypes.forEach((type) => {
    const module = require('./jobs/' + kebabCase(type));
    module.default(agenda);
});

if (jobTypes.length) {
    (async () => {
        await agenda.start();
        console.log('started agenda');

        // await agenda.every('24 hours', 'playlistPublishing');
        await agenda.every('6 hours', 'playlistPublishing');

        // await agenda.now('playlistPublishing');
    })();
}

async function graceful() {
    console.log('in graceful shutdown');
    await agenda.stop();
    process.exit(0);
}

process.on('SIGTERM', graceful);
process.on('SIGINT', graceful);

