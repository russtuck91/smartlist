import { session as localSession } from '../../session/session';
import { Nullable } from '../../shared-models/types';

import { ActionTypes } from '../actions';
import { ActionCall } from '../stores';


export interface SessionState {
    sessionToken?: Nullable<string>;
}

const initialState: SessionState = {
    sessionToken: localSession.getSessionToken()
};

export function sessionReducer(state = initialState, action: ActionCall) {
    switch (action.type) {
        case ActionTypes.SET_SESSION_TOKEN:
            return {
                ...state,
                sessionToken: action.payload.content
            };
        case ActionTypes.CLEAR_SESSION_TOKEN:
            return {
                ...state,
                sessionToken: undefined
            };
        default:
            return state;
    }
}

