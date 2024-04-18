import { NextFunction, Request, Response } from 'express';
import httpContext from 'express-http-context';

import userRepo from '../../repositories/user-repository';
import { isSpotifyError } from '../../services/spotify-service/types';
import { getCurrentUser, updateUser } from '../../services/user-service';

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
        if (isSpotifyError(e)) {
            if (e.statusCode === 401) {
                logger.info('doAndRetry: accessToken has expired, will refresh accessToken and try again');
                const newAccessToken = await refreshAccessToken(user);

                if (newAccessToken) {
                    return await bodyFn(newAccessToken);
                }
            }

            logger.debug(`doAndRetry error: ${e.statusCode} ${e.body.error?.message}`);
        } else {
            logger.debug(e);
        }
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

        await userRepo.findOneByIdAndUpdate(
            user.id,
            {
                updates: {
                    $set: { accessToken: newAccessToken },
                },
            },
        );

        return newAccessToken;
    } catch (e) {
        logger.info('Error in refreshAccessToken');
        logger.info(e.body);
        logger.error(e);
        logger.debug(`Stringified: ${JSON.stringify(e)}`);
        /**
         * e.body.error_description can be things like `Refresh token revoked` and `User does not exist`
         */
        if (isSpotifyError(e)) {
            if (e.statusCode === 400) {
                if ((e.body as any).error === 'invalid_grant') {
                    updateUser(user.username, { spotifyPermissionError: true });
                }
            }
        }
        throw e;
    }
}

export function setSessionTokenContext(req: Request, res: Response, next: NextFunction) {
    const sessionToken = req.headers && req.headers.authorization && req.headers.authorization.replace(/^Bearer /, '');
    if (sessionToken) {
        httpContext.set('sessionToken', sessionToken);
    }

    next();
}
