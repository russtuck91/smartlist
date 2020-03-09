import * as React from 'react';

import { baseRequestUrl } from '../core/requests/requests';


export class Login extends React.Component {
    render() {
        return (
            <div>
                <a href={`${baseRequestUrl}/login`}>Login with Spotify</a>
            </div>
        );
    }
}