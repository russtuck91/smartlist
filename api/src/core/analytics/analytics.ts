import googleAnalytics from '@analytics/google-analytics';
import Analytics from 'analytics';

import { trackingId } from '../../../../shared';


const analytics = Analytics({
    app: 'smartlist',
    plugins: [
        googleAnalytics({
            trackingId: trackingId,
        }),
    ],
});

export default analytics;
