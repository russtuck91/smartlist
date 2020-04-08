import { Button, Link } from '@material-ui/core';
import * as React from 'react';
import { Route } from 'react-router';

import { baseRequestUrl } from '../core/requests/requests';
import { RouteLookup } from '../core/routes/route-lookup';

import { LoginError } from './login-error';


export class Login extends React.Component {
    render() {
        return (
            <div>
                <Link href={`${baseRequestUrl}/login`} underline="none">
                    <Button variant="contained" color="primary">Login with Spotify</Button>
                </Link>
                <Route path={RouteLookup.login.error} component={LoginError} />
            </div>
        );
    }
}