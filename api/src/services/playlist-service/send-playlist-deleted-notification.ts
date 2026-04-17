import { Playlist } from '../../../../shared';

import { sendNotification } from '../subscription-service';

function sendPlaylistDeletedNotification(playlist: Playlist) {
    const { userId, name: playlistName, id: playlistId } = playlist;
    const publishUrl = `/playlists/publish/${playlistId}`;

    sendNotification({
        userId,
        notification: {
            title: 'Playlist deleted from Spotify',
            body: `"${playlistName}" was deleted from Spotify. If this was an accident, click Publish to restore it.`,
            actions: [{
                title: 'Publish',
                action: publishUrl,
            }],
            data: {
                url: publishUrl,
            },
        },
    });
}

export default sendPlaylistDeletedNotification;
