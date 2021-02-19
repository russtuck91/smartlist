import { CircularProgress, Container } from '@material-ui/core';
import * as React from 'react';

import { baseRequestUrl, requests } from '../core/requests/requests';

interface AccountState {
    userInfo?: SpotifyApi.CurrentUsersProfileResponse;
}

export class Account extends React.Component<any, AccountState> {
    state: AccountState = {};

    componentDidMount() {
        this.getUserInfo();
    }

    render() {
        const { userInfo } = this.state;

        return (
            <Container>
                <div>
                    {!userInfo ? (<CircularProgress />) : (
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
            </Container>
        );
    }

    private async getUserInfo() {
        const url = `${baseRequestUrl}/users/me`;
        const userInfo = await requests.get(url);

        this.setState({
            userInfo: userInfo,
        });
    }
}
