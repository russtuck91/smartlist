import googleAnalytics from '@analytics/google-analytics';
import Analytics from 'analytics';

import { trackingId } from '../../../../shared';


const analytics = Analytics({
    app: 'smartlist',
    plugins: [
        googleAnalytics({
            measurementIds: [trackingId],
        }),
    ],
});

export default analytics;
