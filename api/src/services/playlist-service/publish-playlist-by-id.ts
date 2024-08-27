import getPlaylistById from './get-playlist-by-id';
import publishPlaylist from './publish-playlist';


async function publishPlaylistById(id: string) {
    const playlist = await getPlaylistById(id);

    await publishPlaylist(playlist);
}

export default publishPlaylistById;
