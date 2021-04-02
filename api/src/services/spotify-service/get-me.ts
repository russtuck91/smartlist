import initSpotifyApi from './init-spotify-api';


async function getMe(accessToken?: string): Promise<SpotifyApi.CurrentUsersProfileResponse> {
    const spotifyApi = await initSpotifyApi(accessToken);

    const userInfo = await spotifyApi.getMe();
    const user: SpotifyApi.CurrentUsersProfileResponse = userInfo.body;

    return user;
}

export default getMe;
