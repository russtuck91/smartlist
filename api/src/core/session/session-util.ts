import { Response } from 'express';
import httpContext from 'express-http-context';
import mongoist from 'mongoist';

import { spotifyApi } from '../spotify/spotify-api';
import { User } from './models/user';

const db = mongoist('mongodb://localhost:27017/smartify');

export const sessionUtil = {
    doAndRetry: doAndRetry,
    refreshAccessToken: refreshAccessToken
};


async function doAndRetry(bodyFn: () => Promise<void>, res: Response) {
    // TODO: should this retry more than once? may need recursion
    try {
        await bodyFn();
    } catch (e) {
        if (e.statusCode === 401) {
            // refresh access token
            const newAccessToken = await sessionUtil.refreshAccessToken();

            if (newAccessToken) {
                await bodyFn();

                // TODO: should response be added on httpContext?
                res.set('Access-Token', newAccessToken);
            }
        }

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
