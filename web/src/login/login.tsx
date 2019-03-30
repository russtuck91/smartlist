import * as React from 'react';
import SpotifyLogin from 'react-spotify-login';
import { SpotifyAuthResponse } from '../core/spotify/models';
import { session } from '../core/session/session';

const CLIENT_ID = '3550d7a22d0b43118152b8bd9858cdb5';

export class Login extends React.Component {
    render() {
        return (
            <div>
                <div>
                    Access token is: {session.getAccessToken()}
                </div>
                <SpotifyLogin
                    clientId={CLIENT_ID}
                    redirectUri={'http://localhost:3001'}
                    onSuccess={this.onSuccess}
                    onFailure={this.onFailure}
                />
            </div>
        );
    }

    private onSuccess = (response: SpotifyAuthResponse) => {
        console.log(response);

        session.setAccessToken(response.access_token);
        localStorage.setItem('accessToken', response.access_token);
        this.getUserPlaylists();
    }

    private onFailure(response) {
        console.error(response);
    }

    private async getUserPlaylists() {
        const url = 'https://api.spotify.com/v1/me/playlists';

        const result = await fetch(url, {
            headers: { Authorization: `Bearer ${session.getAccessToken()}` }
        });

        console.log(await result.json());
    }
}