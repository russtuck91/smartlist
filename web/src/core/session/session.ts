const ACCESS_TOKEN_KEY = 'accessToken';

export const session = {
    getAccessToken: getAccessToken,
    setAccessToken: setAccessToken,
    clearAccessToken: clearAccessToken
};

function getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
}

function setAccessToken(newToken: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, newToken);
}

function clearAccessToken() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
}