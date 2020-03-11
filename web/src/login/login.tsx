import * as React from 'react';
import { Route } from 'react-router';

import { baseRequestUrl } from '../core/requests/requests';
import { RouteLookup } from '../core/routes/route-lookup';

import { LoginError } from './login-error';


export class Login extends React.Component {
    render() {
        return (
            <div>
                <a href={`${baseRequestUrl}/login`}>Login with Spotify</a>
                <Route path={RouteLookup.login.error} component={LoginError} />
            </div>
        );
    }
}