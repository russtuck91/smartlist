import { store } from '../redux/stores';

function isUserLoggedIn(): boolean {
    const state = store.getState();
    return !!state.session.sessionToken;
}

export default isUserLoggedIn;
