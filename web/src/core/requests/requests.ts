import { session } from '../session/session';

export const requests = {
    get: getRequest
};

async function getRequest(url: string) {
    const result = await fetch(url, {
        headers: {
            Authorization: `Bearer ${session.getAccessToken()}`
        }
    });

    return await result.json();
}