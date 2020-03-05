import * as React from 'react';

import { SpotifyUserObject } from '../core/spotify/models';
import { requests } from '../core/requests/requests';

interface AccountState {
    userInfo?: SpotifyUserObject;
}

export class Account extends React.Component<any, AccountState> {
    state: AccountState = {};

    componentDidMount() {
        // this.getUserInfo();
    }

    render() {
        const { userInfo } = this.state;

        return (
            <div>
                <div>
                    {!userInfo ? null : (
                        <>
                            <h1>
                                Logged in as
                                {' '}
                                {userInfo.display_name}
                            </h1>
                            {userInfo.images && userInfo.images.length > 0 ? (
                                <div><img src={userInfo.images[0].url} /></div>
                            ) : null}
                            <div>
                                Display name:
                                {' '}
                                {userInfo.display_name}
                            </div>
                            <div>
                                Id:
                                {' '}
                                {userInfo.id}
                            </div>
                            <div>
                                Email:
                                {' '}
                                {userInfo.email}
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    private async getUserInfo() {
        // TODO: go through smartlist API
        const url = 'https://api.spotify.com/v1/me';

        const userInfo = await requests.get(url);

        console.log('userInfo:', userInfo);

        this.setState({
            userInfo: userInfo
        });
    }
}