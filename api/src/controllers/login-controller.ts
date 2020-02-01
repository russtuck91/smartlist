import { Controller, Get } from '@overnightjs/core';
import { Request, Response } from 'express';
import mongoist from 'mongoist';

import { spotifyApi } from '../core/spotify/spotify-api';

const db = mongoist('mongodb://localhost:27017/smartify');


@Controller('login')
export class LoginController {
    private STATE_KEY = 'spotify_auth_state';
    // your application requests authorization
    private scopes = ['user-read-private', 'user-read-email', 'user-library-read'];

    /** Generates a random string containing numbers and letters of N characters */
    private generateRandomString = (N: number) => (Math.random().toString(36)+Array(N).join('0')).slice(2, N+2);

    @Get('/')
    private getSpotifyLoginUrl(req: Request, res: Response) {
        const state = this.generateRandomString(16);
        res.cookie(this.STATE_KEY, state);
        res.redirect(spotifyApi.createAuthorizeURL(this.scopes, state));
    }


    @Get('callback')
    private processSpotifyAuth(req: Request, res: Response) {
        const { code, state } = req.query;
        const storedState = req.cookies ? req.cookies[this.STATE_KEY] : null;

        // first do state validation
        if (state === null || state !== storedState) {
            // TODO: error handling
            res.redirect('/#/error/state mismatch');
        // if the state is valid, get the authorization code and pass it on to the client
        } else {
            res.clearCookie(this.STATE_KEY);
            // Retrieve an access token and a refresh token
            spotifyApi.authorizationCodeGrant(code).then(async (data: any) => {
                const { expires_in, access_token, refresh_token } = data.body;
        
                // Set the access token on the API object to use it in later calls
                spotifyApi.setAccessToken(access_token);
                spotifyApi.setRefreshToken(refresh_token);

                const userInfo = await spotifyApi.getMe();
                console.log(userInfo.body);

                const accessTokenPatch = {
                    username: userInfo.body.id,
                    accessToken: access_token,
                    refreshToken: refresh_token
                };

                // Store in DB
                db.users.update(
                    { username: accessTokenPatch.username },
                    { $set: accessTokenPatch },
                    {
                    upsert: true
                    }
                );
        
                // we can also pass the token to the browser to make requests from there
                res.redirect(`http://localhost:3000/login/callback/${access_token}/${refresh_token}`);
            }).catch((err: any) => {
                console.error(err);
                // TODO: error handling
                res.redirect('/error/invalid token');
            });
        }
    }
    
    
}