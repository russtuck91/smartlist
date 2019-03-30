const ACCESS_TOKEN_KEY = 'accessToken';

export const session = {
    getAccessToken: getAccessToken,
    setAccessToken: setAccessToken
};

function getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
}

function setAccessToken(newToken: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, newToken);
}