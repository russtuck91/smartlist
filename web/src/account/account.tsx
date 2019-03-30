import * as React from 'react';

import { session } from '../core/session/session';
import { SpotifyUserObject } from '../core/spotify/models';
import { requests } from '../core/requests/requests';

interface AccountState {
    userInfo?: SpotifyUserObject;
}

export class Account extends React.Component<any, AccountState> {
    state: AccountState = {};

    componentDidMount() {
        this.getUserInfo();
    }

    render() {
        const { userInfo } = this.state;

        return (
            <div>
                <div>
                    {!userInfo ? null : (
                        <>
                            <h1>Logged in as {userInfo.display_name}</h1>
                            <div><img src={userInfo.images[0].url} /></div>
                            <div>Display name: {userInfo.display_name}</div>
                            <div>Id: {userInfo.id}</div>
                            <div>Email: {userInfo.email}</div>
                            <div>Access token is: {session.getAccessToken()}</div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    private async getUserInfo() {
        const url = 'https://api.spotify.com/v1/me';

        const userInfo = await requests.get(url);

        this.setState({
            userInfo: userInfo
        });
    }
}