import mongoist from 'mongoist';
import { spotifyApi } from '../spotify/spotify-api';
import { User } from './models/user';

const db = mongoist('mongodb://localhost:27017/smartify');

export const sessionUtil = {
    refreshAccessToken: refreshAccessToken
};


async function refreshAccessToken(accessToken: string): Promise<string|undefined> {
    try {
        console.log('in refreshAccessToken');
        console.log('accessToken :: ', accessToken);

        const foundUser: User|null = await db.users.findOne({ accessToken: accessToken });
        if (!foundUser) {
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

        return newAccessToken;
    } catch (e) {
        console.error(e);
    }
}
