import { Playlist } from '../../../../shared';

import playlistRepo from '../../repositories/playlist-repository';


async function updatePlaylist(id: string, playlist: Partial<Playlist>) {
    delete playlist.id;
    delete playlist.userId;

    playlist.updatedAt = new Date();

    const result = await playlistRepo.findOneByIdAndUpdate(
        id,
        {
            updates: { $set: playlist },
        },
    );

    return result;
}

export default updatePlaylist;
