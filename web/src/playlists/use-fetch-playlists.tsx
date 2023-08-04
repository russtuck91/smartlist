import { useQuery } from '@tanstack/react-query';

import { Playlist } from '../../../shared';

import { baseRequestUrl, requests } from '../core/requests/requests';


export const getPlaylistsQueryKey = () => ['playlists'];

export const useFetchPlaylists = () => {
    return useQuery<Playlist[]>({
        queryKey: getPlaylistsQueryKey(),
        queryFn: async () => {
            return await requests.get(`${baseRequestUrl}/playlists/lists`);
        },
        staleTime: (60 * 60 * 1000),
        refetchOnWindowFocus: false,
        refetchOnMount: 'always',
    });
};
