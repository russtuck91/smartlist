import { ObjectId } from 'mongodb';

import logger from '../../core/logger/logger';
import { SpotifyApi } from '../../core/spotify/spotify-api';

import { getUserById } from '../user-service';


async function createNewPlaylist(playlistName: string, userId: ObjectId) {
    logger.debug('>>>> Entering createNewPlaylist()');

    const user = await getUserById(userId);
    const spotifyApi = new SpotifyApi();
    spotifyApi.setAccessToken(user.accessToken);

    const description = `Created by SmartList${ process.env.NODE_ENV === 'development' ? ' [DEV]' : ''}`;

    const playlist = await spotifyApi.createPlaylist(playlistName, {
        description: description,
    });

    return playlist.body;
}

export default createNewPlaylist;
