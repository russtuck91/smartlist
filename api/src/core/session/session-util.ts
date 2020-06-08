import { Request, Response, NextFunction } from 'express';
import httpContext from 'express-http-context';

import { SpotifyApi } from '../spotify/spotify-api';
import { User } from './models/user';
import { getCurrentUser } from '../../services/user-service';
import { db } from '../db/db';



export async function doAndRetryWithCurrentUser(bodyFn: (accessToken: string) => Promise<void>) {
    const currentUser = await getCurrentUser();

    await doAndRetry(bodyFn, currentUser);
}

export async function doAndRetry(bodyFn: (accessToken: string) => Promise<void>, user: User) {
    console.log('in doAndRetry');
    try {
        return await bodyFn(user.accessToken);
    } catch (e) {
        console.log('error found in doAndRetry');
        if (e.statusCode === 401) {
            const newAccessToken = await refreshAccessToken(user);

            if (newAccessToken) {
                return await bodyFn(newAccessToken);
            }
        }

        // console.error(e);
        console.log(e);
        throw e;
    }
}

export async function refreshAccessToken(user: User) {
    try {
        console.log('in refreshAccessToken');

        const refreshToken = user.refreshToken;
        const spotifyApi = new SpotifyApi();
        spotifyApi.setRefreshToken(refreshToken);

        const refreshResponse = await spotifyApi.refreshAccessToken();
        const newAccessToken = refreshResponse.body.access_token;

        db.users.update(
            { _id: user._id },
            { $set: { accessToken: newAccessToken } }
        );

        return newAccessToken;
    } catch (e) {
        console.error(e);
    }
}

export function setSessionTokenContext(req: Request, res: Response, next: NextFunction) {
    const sessionToken = req.headers && req.headers.authorization && req.headers.authorization.replace(/^Bearer /, '');
    if (sessionToken) {
        httpContext.set('sessionToken', sessionToken);
    }

    next();
}
