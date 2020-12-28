import { NextFunction, Request, Response } from 'express';
import httpContext from 'express-http-context';

import { getCurrentUser } from '../../services/user-service';
import { db } from '../db/db';
import logger from '../logger/logger';
import { SpotifyApi } from '../spotify/spotify-api';
import { User } from './models/user';



export async function doAndRetryWithCurrentUser(bodyFn: (accessToken: string) => Promise<void>) {
    const currentUser = await getCurrentUser();

    await doAndRetry(bodyFn, currentUser);
}

export async function doAndRetry(bodyFn: (accessToken: string) => Promise<void>, user: User) {
    logger.debug('>>>> Entering doAndRetry()');
    try {
        return await bodyFn(user.accessToken);
    } catch (e) {
        logger.debug('error found in doAndRetry', e.statusCode);
        if (e.statusCode === 401) {
            logger.debug('accessToken has expired, will refresh accessToken and try again');
            const newAccessToken = await refreshAccessToken(user);

            if (newAccessToken) {
                return await bodyFn(newAccessToken);
            }
        }

        logger.debug(e);
        throw e;
    }
}

export async function refreshAccessToken(user: User) {
    logger.debug('>>>> Entering refreshAccessToken()');
    try {
        const refreshToken = user.refreshToken;
        const spotifyApi = new SpotifyApi();
        spotifyApi.setRefreshToken(refreshToken);

        const refreshResponse = await spotifyApi.refreshAccessToken();
        const newAccessToken = refreshResponse.body.access_token;

        await db.users.update(
            { _id: user._id },
            { $set: { accessToken: newAccessToken } }
        );

        return newAccessToken;
    } catch (e) {
        logger.error(e);
    }
}

export function setSessionTokenContext(req: Request, res: Response, next: NextFunction) {
    const sessionToken = req.headers && req.headers.authorization && req.headers.authorization.replace(/^Bearer /, '');
    if (sessionToken) {
        httpContext.set('sessionToken', sessionToken);
    }

    next();
}
