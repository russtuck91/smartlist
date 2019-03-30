import * as React from 'react';

import { session } from '../core/session/session';

export class Account extends React.Component {
    componentDidMount() {
        this.getUserInfo();
    }

    render() {
        return (
            <div>
                <div>
                    Access token is: {session.getAccessToken()}
                </div>
            </div>
        );
    }

    private async getUserInfo() {
        const url = 'https://api.spotify.com/v1/me';

        const result = await fetch(url, {
            headers: { Authorization: `Bearer ${session.getAccessToken()}` }
        });

        console.log(await result.json());
    }
}