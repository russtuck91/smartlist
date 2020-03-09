
export enum ActionTypes {
    SET_SESSION_TOKEN = 'SET_SESSION_TOKEN',
    CLEAR_SESSION_TOKEN = 'CLEAR_SESSION_TOKEN'
}


export function setSessionToken(content: string) {
    return {
        type: ActionTypes.SET_SESSION_TOKEN,
        payload: {
            content
        }
    };
}

export function clearSessionToken() {
    return {
        type: ActionTypes.CLEAR_SESSION_TOKEN,
        payload: {}
    };
}

