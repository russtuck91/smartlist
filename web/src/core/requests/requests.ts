import { session } from '../session/session';

export const baseRequestUrl = 'http://localhost:5000';

export const requests = {
    get: getRequest,
    post: postRequest,
    put: putRequest,
    delete: deleteRequest
};

async function getRequest(url: string): Promise<any> {
    return makeDirectRequest('GET', url);
}

async function postRequest(url: string, body?: any) {
    return makeDirectRequest('POST', url, body);
}

async function putRequest(url: string, body: any) {
    return makeDirectRequest('PUT', url, body);
}

async function deleteRequest(url: string) {
    return makeDirectRequest('DELETE', url);
}

function makeDirectRequest(method: string, url: string, body?: any) {
    return fetch(url, {
        method: method,
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.getAccessToken()}`
        }
    })
        .then(async (response: Response) => {
            if (!response.ok) {
                switch (response.status) {
                    case 401:
                        console.log('unauthorized');
                        session.clearAccessToken();
                        break;
                    default:
                        break;
                }
                return;
            }

            const newAccessToken = response.headers.get('Access-Token');
            if (newAccessToken) {
                console.log('Received new access token from API, will update in frontend storage');
                session.setAccessToken(newAccessToken);
            }

            try {
                return await response.json();
            } catch (e) {
                // console.log(e);
                // return;
            }
        });
}