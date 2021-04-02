import getUsersPlaylists from './get-users-playlists';


async function userHasPlaylist(userId: string, playlistId: string, accessToken: string|undefined): Promise<boolean> {
    const usersPlaylists = await getUsersPlaylists(userId, accessToken);

    if (!usersPlaylists) { return false; }

    return !!(usersPlaylists.items.find((item) => item.id === playlistId));
}

export default userHasPlaylist;
