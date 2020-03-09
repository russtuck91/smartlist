import { clearSessionToken } from '../redux/actions';
import { store } from '../redux/stores';

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
    const state = store.getState();

    return fetch(url, {
        method: method,
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${state.session.sessionToken}`
        }
    })
        .then(async (response: Response) => {
            if (!response.ok) {
                switch (response.status) {
                    case 401:
                        console.log('unauthorized');
                        store.dispatch(clearSessionToken());
                        break;
                    default:
                        break;
                }
                return;
            }

            try {
                return await response.json();
            } catch (e) {
                // console.log(e);
                // return;
            }
        });
}