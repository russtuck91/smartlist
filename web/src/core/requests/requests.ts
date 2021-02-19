import logger from '../logger/logger';
import { clearSessionToken } from '../redux/actions';
import { store } from '../redux/stores';

export const baseRequestUrl = `${process.env.REACT_APP_URL || process.env.APP_URL || process.env.NODE_ENV !== 'production' ? 'http://localhost:5000' : ''}/api`;

export const requests = {
    get: getRequest,
    post: postRequest,
    put: putRequest,
    delete: deleteRequest,
};

async function getRequest(url: string): Promise<any> {
    return await makeDirectRequest('GET', url);
}

async function postRequest(url: string, body?: any) {
    return await makeDirectRequest('POST', url, body);
}

async function putRequest(url: string, body: any) {
    return await makeDirectRequest('PUT', url, body);
}

async function deleteRequest(url: string) {
    return await makeDirectRequest('DELETE', url);
}

async function makeDirectRequest(method: string, url: string, body?: any) {
    const state = store.getState();

    const response: Response = await fetch(url, {
        method: method,
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${state.session.sessionToken}`,
        },
    });
    if (!response.ok) {
        switch (response.status) {
            case 401:
                logger.info('Received 401 status code, users token expired');
                store.dispatch(clearSessionToken());
                break;
            default:
                logger.error(response.statusText, response.status, response.url);
                throw new Error(response.statusText);
        }
        return;
    }

    try {
        return await response.json();
    } catch (e) {
        logger.debug('Error getting JSON response from HTTP request', method, url, response.status);
        // return;
    }
}
