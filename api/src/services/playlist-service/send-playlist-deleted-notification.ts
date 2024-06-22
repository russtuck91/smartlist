import { ObjectID } from 'mongodb';

import { sendNotification } from '../subscription-service';

function sendPlaylistDeletedNotification(userId: ObjectID, playlistName: string) {
    sendNotification({
        userId,
        title: 'Playlist deleted from Spotify',
        body: `The smart playlist ${playlistName} was deleted from Spotify. If this was an accident, click Publish to restore it.`,
    });
}

export default sendPlaylistDeletedNotification;
