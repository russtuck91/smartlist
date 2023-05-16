import logger from '../../core/logger/logger';

import getUsersPlaylists from './get-users-playlists';
import searchForItem, { SearchType } from './search-for-item';
import { isSpotifyError } from './types';


async function handledSearchForItem(type: SearchType, item: string, accessToken: string|undefined) {
    try {
        return (await searchForItem(type, item, accessToken)).items;
    } catch (e) {
        if (isSpotifyError(e)) {
            if (e.statusCode === 400) {
                return [];
            }
        }
        throw e;
    }
}

async function searchForPlaylist(text: string, accessToken: string): Promise<SpotifyApi.PlaylistObjectSimplified[]> {
    logger.debug(`>>>> Entering searchForPlaylist(text = ${text}`);

    const [usersPlaylists, searchedPlaylists] = await Promise.all([
        getUsersPlaylists(accessToken),
        handledSearchForItem(SearchType.playlist, text, accessToken),
    ]);

    const result: SpotifyApi.PlaylistObjectSimplified[] = [
        ...usersPlaylists.items.filter((p) => p.name.toLowerCase().includes(text.toLowerCase().trim())),
        ...searchedPlaylists as SpotifyApi.PlaylistObjectSimplified[],
    ];
    return result;
}

export default searchForPlaylist;
