import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { Integration } from '@sentry/types';

import logger from '../../core/logger/logger';

function setupSentry({
    integrations = [],
}: {
    integrations?: Integration[],
} = {}) {
    logger.info(`>>>> Entering setupSentry(), version = ${process.env.npm_package_version}`);
    Sentry.init({
        dsn: 'https://bc8298e7d82ad68325980563f6415e5b@o4505802448175104.ingest.sentry.io/4505802454138880',
        release: `smartlist-api@${process.env.npm_package_version}`,
        includeLocalVariables: true,
        integrations: [
            ...integrations,
            new ProfilingIntegration(),
        ],
        tracesSampleRate: 0.01,
        profilesSampleRate: 1.0,
    });
}

export default setupSentry;
