import { createStore } from 'redux';

import { session } from '../session/session';
import { ActionTypes } from './actions';
import { reducers } from './reducers';
import { SessionState } from './reducers/session';


export interface ActionCall {
    type: ActionTypes;
    payload: any;
}

export interface FullStore {
    session: SessionState;
}

export const store = createStore(reducers);


store.subscribe(onStateChange);

// Persist sessionToken storage to the localStorage
function onStateChange() {
    const state = store.getState();
    console.log(state);

    session.setSessionToken(state.session.sessionToken);
}

