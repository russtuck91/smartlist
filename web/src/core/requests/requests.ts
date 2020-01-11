import { session } from '../session/session';

export const baseRequestUrl = `http://localhost:5000`;

export const requests = {
    get: getRequest,
    post: postRequest,
    put: putRequest
};

async function getRequest(url: string): Promise<any> {
    return fetch(url, {
        headers: {
            Authorization: `Bearer ${session.getAccessToken()}`
        }
    })
    .then(async (response: Response) => {
        if (!response.ok) {
            console.log('ERROR HANDLING');
            console.log(response.status);
            console.log(response.statusText);
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

        return await response.json();
    });
}

async function postRequest(url: string, body: any) {
    return fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json",
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

            return await response.json();
        });
}

async function putRequest(url: string, body: any) {
    return fetch(url, {
        method: 'PUT',
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json",
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

            // TODO: only if there is a json response
            // return await response.json();
        });
}

function makeDirectRequest() {

}