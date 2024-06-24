import { useQuery } from '@tanstack/react-query';

import { Playlist } from '../../../shared';

import { baseRequestUrl, requests } from '../core/requests/requests';


export const getPlaylistQueryKey = (playlistId: string) => ['playlist', playlistId];

export const useFetchPlaylist = (playlistId: string) => {
    return useQuery<Playlist>({
        queryKey: getPlaylistQueryKey(playlistId),
        queryFn: async () => {
            return await requests.get(`${baseRequestUrl}/playlists/${playlistId}`);
        },
        staleTime: (60 * 60 * 1000),
        refetchOnWindowFocus: false,
        refetchOnMount: 'always',
    });
};
