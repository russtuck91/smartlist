import { User } from '../../../../shared';

import { sendNotification } from '../subscription-service';


function sendSpotifyPermissionErrorNotification(user: User) {
    sendNotification({
        userId: user.id,
        notification: {
            title: 'Permission error with Spotify',
            body: 'Smartlist can no longer access your Spotify account. Click to fix Spotify permissions.',
            data: {
                url: '/account',
            },
        },
    });
}

export default sendSpotifyPermissionErrorNotification;
