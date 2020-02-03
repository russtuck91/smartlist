import * as React from 'react';
import SpotifyLogin from 'react-spotify-login';
import { SpotifyAuthResponse, SpotifyUserObject } from '../core/spotify/models';
import { session } from '../core/session/session';
import { baseRequestUrl, requests } from '../core/requests/requests';
import { AccessTokenPatch } from './models';

const CLIENT_ID = '3550d7a22d0b43118152b8bd9858cdb5';

export class Login extends React.Component {
    render() {
        return (
            <div>
                <div>
                    Access token is: {session.getAccessToken()}
                </div>
                <a href={`${baseRequestUrl}/login`}>Login with Spotify</a>
            </div>
        );
    }

    private onSuccess = async (response: SpotifyAuthResponse) => {
        console.log(response);

        // Client side access token
        session.setAccessToken(response.access_token);

        const userInfo = await this.getUserInfo();

        // Server side access token
        const accessTokenPatch: AccessTokenPatch = {
            username: userInfo.id,
            accessToken: response.access_token
        };
        await requests.put(`${baseRequestUrl}/users/accessToken`, accessTokenPatch);
    }

    private onFailure(response) {
        console.error(response);
    }

    private async getUserInfo(): Promise<SpotifyUserObject> {
        return await requests.get('https://api.spotify.com/v1/me');
    }
}