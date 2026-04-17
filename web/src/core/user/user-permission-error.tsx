import { Box, Button, Link } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import React from 'react';

import { baseRequestUrl } from '../requests/requests';

import { useFetchUserMe } from './use-fetch-user-me';


const UserPermissionError = () => {
    const { data: user, isLoading } = useFetchUserMe();

    // While loading
    if (isLoading || !user) {
        return null;
    }

    // No permission error, render nothing
    if (!user.spotifyPermissionError) {
        return null;
    }

    return (
        <Box my={2}>
            <Alert
                severity="error"
                action={(
                    <Link underline="none" href={`${baseRequestUrl}/login`}>
                        <Button variant="contained" color="primary">Click here to fix it</Button>
                    </Link>
                )}
            >
                There is a permission error with your Spotify account
            </Alert>
        </Box>
    );
};

export default UserPermissionError;
