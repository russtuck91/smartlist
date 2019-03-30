import { session } from '../session/session';

export const requests = {
    get: getRequest
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