const SESSION_TOKEN_KEY = 'sessionToken';

export const session = {
    getSessionToken: getSessionToken,
    setSessionToken: setSessionToken,
    clearSessionToken: clearSessionToken
};

function getSessionToken() {
    return localStorage.getItem(SESSION_TOKEN_KEY);
}

function setSessionToken(newToken: string) {
    localStorage.setItem(SESSION_TOKEN_KEY, newToken);
}

function clearSessionToken() {
    localStorage.removeItem(SESSION_TOKEN_KEY);
}