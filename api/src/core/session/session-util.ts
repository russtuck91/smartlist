import { Request, Response, NextFunction } from 'express';
import httpContext from 'express-http-context';
import mongoist from 'mongoist';

import { spotifyApi } from '../spotify/spotify-api';
import { User } from './models/user';
import { getCurrentUser } from '../../services/user-service';

const db = mongoist('mongodb://localhost:27017/smartify');



export async function doAndRetryWithCurrentUser(bodyFn: () => Promise<void>) {
    const currentUser = await getCurrentUser();

    await doAndRetry(bodyFn, currentUser);
}

export async function doAndRetry(bodyFn: () => Promise<void>, user: User) {
    console.log('in doAndRetry');
    try {
        return await bodyFn();
    } catch (e) {
        console.log('error found in doAndRetry');
        if (e.statusCode === 401) {
            const newAccessToken = await refreshAccessToken(user);

            if (newAccessToken) {
                spotifyApi.setAccessToken(newAccessToken);

                return await bodyFn();
            }
        }

        // console.error(e);
    }
}

export async function refreshAccessToken(user: User) {
    try {
        console.log('in refreshAccessToken');

        const refreshToken = user.refreshToken;
        spotifyApi.setRefreshToken(refreshToken);

        const refreshResponse = await spotifyApi.refreshAccessToken();
        console.log(refreshResponse);
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
