import {
    Box, Button, Container, Link, Typography,
} from '@material-ui/core';
import * as React from 'react';
import { Route } from 'react-router';

import { SecondaryAppBar } from '../core/components/secondary-app-bar';
import { baseRequestUrl } from '../core/requests/requests';
import { RouteLookup } from '../core/routes/route-lookup';

import { LoginError } from './login-error';


export class Login extends React.Component {
    render() {
        return (
            <Box display="flex" flex="1 1 auto" flexDirection="column">
                <SecondaryAppBar>
                    <Typography variant="h6">
                        Login
                    </Typography>
                </SecondaryAppBar>
                <Container>
                    <h2>Login with Spotify to get started</h2>
                    <Link href={`${baseRequestUrl}/login`} underline="none">
                        <Button variant="contained" color="primary">Login with Spotify</Button>
                    </Link>
                    <Route path={RouteLookup.login.error} component={LoginError} />
                </Container>
            </Box>
        );
    }
}
