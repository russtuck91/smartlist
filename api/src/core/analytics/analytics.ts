import googleAnalytics from '@analytics/google-analytics';
import Analytics from 'analytics';

import { trackingId } from '../../../../shared';


const analytics = Analytics({
    app: 'smartlist',
    plugins: [
        googleAnalytics({
            // trackingId is for GA v3 aka Universal Analytics - supposedly reaching EOL on 7/1/23
            trackingId: 'UA-188450923-1',
            // measurementIds is for GA v4 - not currently working server-side
            measurementIds: [trackingId],
        }),
    ],
});

export default analytics;
