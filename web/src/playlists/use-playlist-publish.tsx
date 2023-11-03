import { useMutation, useQueryClient } from '@tanstack/react-query';

import { sleep } from '../../../shared';

import { playlistPublishedEvent } from '../core/analytics/analytics-utils';
import { baseRequestUrl, requests } from '../core/requests/requests';

import { getPlaylistsQueryKey } from './use-fetch-playlists';


export const getPlaylistPublishKey = (playlistId) => ['playlistPublish', playlistId];

export const usePlaylistPublish = (playlistId: string|undefined) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: getPlaylistPublishKey(playlistId),
        mutationFn: async () => {
            await sleep(2000);
            await requests.post(`${baseRequestUrl}/playlists/publish/${playlistId}`);
            playlistPublishedEvent();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getPlaylistsQueryKey() });
        },
    });
};
