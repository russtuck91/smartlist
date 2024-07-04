import { NextFunction, Request, Response } from 'express';
import httpContext from 'express-http-context';

import { User } from '../../../../shared';

import userRepo from '../../repositories/user-repository';
import { isSpotifyAuthError, isSpotifyError } from '../../services/spotify-service/types';
import { getCurrentUser, sendSpotifyPermissionErrorNotification, updateUser } from '../../services/user-service';

import logger from '../logger/logger';
import maskToken from '../logger/mask-token';
import { SpotifyApi } from '../spotify/spotify-api';



export async function doAndRetryWithCurrentUser<T>(bodyFn: (accessToken: string) => Promise<T>) {
    const currentUser = await getCurrentUser();

    return await doAndRetry(bodyFn, currentUser);
}

export async function doAndRetry<T>(bodyFn: (accessToken: string) => Promise<T>, user: User) {
    logger.debug(`>>>> Entering doAndRetry(accessToken = ${maskToken(user.accessToken)}`);
    try {
        return await bodyFn(user.accessToken);
    } catch (e) {
        if (isSpotifyError(e)) {
            if (e.statusCode === 401) {
                logger.debug('doAndRetry: accessToken has expired, will refresh accessToken and try again');
                const newAccessToken = await refreshAccessToken(user);

                logger.debug(`Got new access token, now it is: ${maskToken(newAccessToken)}`);
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
        logger.error(e);
        if (isSpotifyAuthError(e)) {
            if (e.statusCode === 400) {
                /* e.body.error_description can be things like `Refresh token revoked` and `User does not exist` */
                if (e.body.error === 'invalid_grant') {
                    await updateUser(user.username, { spotifyPermissionError: true });
                    sendSpotifyPermissionErrorNotification(user);
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
