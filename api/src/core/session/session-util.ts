import { Response, Request } from 'express';
import httpContext from 'express-http-context';
import mongoist from 'mongoist';

import { spotifyApi } from '../spotify/spotify-api';
import { User } from './models/user';

const db = mongoist('mongodb://localhost:27017/smartify');

export const sessionUtil = {
    doAndRetry: doAndRetry,
    refreshAccessToken: refreshAccessToken,
    setAccessTokenContext: setAccessTokenContext
};


// TODO: consolidate these functions

async function doAndRetry(bodyFn: () => Promise<void>, res: Response) {
    // TODO: should this retry more than once? may need recursion
    try {
        await bodyFn();
    } catch (e) {
        if (e.statusCode === 401) {
            // refresh access token
            const newAccessToken = await sessionUtil.refreshAccessToken();

            if (newAccessToken) {
                // TODO: should response be added on httpContext?
                res.set('Access-Token', newAccessToken);

                await bodyFn();
            }
        }

        console.error(e);
    }
}

export async function doAndRetryV2(bodyFn: () => Promise<void>, user: User) {
    try {
        await bodyFn();
    } catch (e) {
        console.log('error found in doAndRetryV2');
        if (e.statusCode === 401) {
            const newAccessToken = await refreshAccessTokenV2(user.accessToken);

            if (newAccessToken) {
                spotifyApi.setAccessToken(newAccessToken);

                await bodyFn();
            }
        }

        // console.error(e);
    }
}

// pass user in as param? avoid db call
export async function refreshAccessTokenV2(accessToken: string) {
    try {
        console.log('in refreshAccessToken');
        console.log('accessToken :: ', accessToken);

        const foundUser: User|null = await db.users.findOne({ accessToken: accessToken });
        if (!foundUser) {
            console.log('did not find user with matching access token');
            return;
        }

        let refreshToken = foundUser.refreshToken;
        spotifyApi.setRefreshToken(refreshToken);

        const refreshResponse = await spotifyApi.refreshAccessToken();
        console.log(refreshResponse);
        const newAccessToken = refreshResponse.body.access_token;

        db.users.update(
            { accessToken: accessToken },
            { $set: { accessToken: newAccessToken } }
        );

        // httpContext.set('accessToken', newAccessToken);
        return newAccessToken;
    } catch (e) {
        console.error(e);
    }
}

async function refreshAccessToken(): Promise<string|undefined> {
    try {
        console.log('in refreshAccessToken');
        const accessToken = httpContext.get('accessToken');
        console.log('accessToken :: ', accessToken);

        const foundUser: User|null = await db.users.findOne({ accessToken: accessToken });
        if (!foundUser) {
            console.log('did not find user with matching access token');
            return;
        }

        let refreshToken = foundUser.refreshToken;
        spotifyApi.setRefreshToken(refreshToken);

        const refreshResponse = await spotifyApi.refreshAccessToken();
        console.log(refreshResponse);
        const newAccessToken = refreshResponse.body.access_token;

        db.users.update(
            { accessToken: accessToken },
            { $set: { accessToken: newAccessToken } }
        );

        httpContext.set('accessToken', newAccessToken);
        return newAccessToken;
    } catch (e) {
        console.error(e);
    }
}

function setAccessTokenContext(req: Request) {
    const accessToken = req.headers && req.headers.authorization && req.headers.authorization.replace(/^Bearer /, '');
    if (!accessToken) { return; }
    httpContext.set('accessToken', accessToken);
}
