import * as Factory from 'factory.ts';
import moment from 'moment';
import { ObjectId } from 'mongodb';

import { User } from '../session/models';

export const userFactory = Factory.Sync.makeFactory<User>({
    _id: new ObjectId(),
    id: new ObjectId().toHexString(),
    createdAt: moment().toDate(),
    updatedAt: moment().toDate(),

    username: 'testUsername',

    sessionToken: [],

    accessToken: 'testAccessToken',
    refreshToken: 'testRefreshToken',

    suppressNewCacheFeature: false,
    enableNotificationFeature: false,
});
