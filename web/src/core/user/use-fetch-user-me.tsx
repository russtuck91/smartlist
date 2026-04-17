import { useQuery } from '@tanstack/react-query';

import { User } from '../../../../shared';

import { baseRequestUrl, requests } from '../requests/requests';
import isUserLoggedIn from '../session/is-user-logged-in';


export const useFetchUserMe = () => {
    return useQuery<User>({
        queryKey: ['user', 'me'],
        queryFn: async () => {
            if (!isUserLoggedIn()) {
                return null;
            }
            return await requests.get(`${baseRequestUrl}/users/me`);
        },
        staleTime: (60 * 60 * 1000),
        refetchOnWindowFocus: false,
        refetchOnMount: 'always',
    });
};
