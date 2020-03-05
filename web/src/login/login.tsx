import * as React from 'react';
import { session } from '../core/session/session';
import { baseRequestUrl } from '../core/requests/requests';


export class Login extends React.Component {
    render() {
        return (
            <div>
                <div>
                    Session token is: 
                    {' '}
                    {session.getSessionToken()}
                </div>
                <a href={`${baseRequestUrl}/login`}>Login with Spotify</a>
            </div>
        );
    }
}