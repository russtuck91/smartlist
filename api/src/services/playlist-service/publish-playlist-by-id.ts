import getPlaylistById from './get-playlist-by-id';
import publishPlaylist from './publish-playlist';


async function publishPlaylistById(id: string, accessToken: string) {
    const playlist = await getPlaylistById(id);

    await publishPlaylist(playlist, accessToken);
}

export default publishPlaylistById;
