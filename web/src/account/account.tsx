import { Box, CircularProgress, Typography } from '@material-ui/core';
import * as React from 'react';

import { SecondaryAppBar } from '../core/components/secondary-app-bar';
import { useFetchUserMe } from '../core/user/use-fetch-user-me';

import AccountContent from './account-content';


export const Account = () => {
    const { data: user, isLoading } = useFetchUserMe();

    return (
        <Box display="flex" flex="1 1 auto" flexDirection="column">
            <SecondaryAppBar>
                <Typography variant="h6">
                    Account
                </Typography>
            </SecondaryAppBar>
            {isLoading || !user ? (
                <Box flex="1 1 auto" display="flex" alignItems="center" justifyContent="center">
                    <CircularProgress />
                </Box>
            ) : (
                <AccountContent user={user} />
            )}
        </Box>
    );
};
