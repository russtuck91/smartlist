import { Playlist } from '../../../../shared';

import { sendNotification } from '../subscription-service';

function sendPlaylistDeletedNotification(playlist: Playlist) {
    const { userId, name: playlistName } = playlist;

    sendNotification({
        userId,
        notification: {
            title: 'Playlist deleted from Spotify',
            body: `The smart playlist ${playlistName} was deleted from Spotify. If this was an accident, click Publish to restore it.`,
        },
    });
}

export default sendPlaylistDeletedNotification;
