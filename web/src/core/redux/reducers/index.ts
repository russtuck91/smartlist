import { combineReducers } from 'redux';

import { sessionReducer } from './session';

export const reducers = combineReducers({
    session: sessionReducer
});
