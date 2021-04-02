import { Controller, Get } from '@overnightjs/core';
import { Request, Response } from 'express';

import logger from '../core/logger/logger';
import { User } from '../core/session/models';
import { baseUiUrl } from '../core/shared-models';
import { SpotifyApi } from '../core/spotify/spotify-api';

import spotifyService from '../services/spotify-service/spotify-service';
import { removeSessionTokenFromCurrentUser, updateUser } from '../services/user-service';


interface SessionRequest extends Request {
    sessionID: string;
}


@Controller('login')
export class LoginController {
    private STATE_KEY = 'spotify_auth_state';
    // your application requests authorization
    private scopes = [
        'user-read-private',
        'user-read-email',
        'user-library-read',
        'playlist-read-private',
        'playlist-read-collaborative',
        'playlist-modify-public',
        'playlist-modify-private',
    ];

    /** Generates a random string containing numbers and letters of N characters */
    private generateRandomString = (N: number) => (Math.random().toString(36)+Array(N).join('0')).slice(2, N+2);

    @Get('/')
    private getSpotifyLoginUrl(req: Request, res: Response) {
        const state = this.generateRandomString(16);
        res.cookie(this.STATE_KEY, state);

        const spotifyApi = new SpotifyApi();
        res.redirect(spotifyApi.createAuthorizeURL(this.scopes, state));
    }


    @Get('callback')
    private async processSpotifyAuth(req: SessionRequest, res: Response) {
        const { code, state } = req.query;
        const storedState = req.cookies ? req.cookies[this.STATE_KEY] : null;

        // first do state validation
        if (state === null || state !== storedState) {
            // TODO: error handling
            res.redirect(`${baseUiUrl}/login/error/state mismatch`);
        // if the state is valid, get the authorization code and pass it on to the client
        } else {
            res.clearCookie(this.STATE_KEY);
            try {
                const spotifyApi = new SpotifyApi();
                const data = await spotifyApi.authorizationCodeGrant(code);
                const { expires_in, access_token, refresh_token } = data.body;

                const user = await spotifyService.getMe(access_token);

                const username = user.id;
                const accessTokenPatch: Partial<User> = {
                    username: username,
                    accessToken: access_token,
                    refreshToken: refresh_token,
                };
                const sessionID = req.sessionID!;

                // Store in DB
                updateUser(username, accessTokenPatch, sessionID);

                // pass the token to the frontend
                res.redirect(`${baseUiUrl}/login/callback/${sessionID}`);
            } catch (err) {
                logger.error(err);
                // TODO: error handling
                res.redirect(`${baseUiUrl}/login/error/invalid token`);
            }
        }
    }


    @Get('logout')
    private async logout(req: Request, res: Response) {
        await removeSessionTokenFromCurrentUser();

        res.send();
    }


}
