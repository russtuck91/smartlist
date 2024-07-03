import * as Factory from 'factory.ts';
import moment from 'moment';
import { ObjectId } from 'mongodb';

import { User } from '../../../../shared';

export const userFactory = Factory.Sync.makeFactory<User>({
    id: new ObjectId().toHexString(),
    createdAt: moment().toDate(),
    updatedAt: moment().toDate(),

    username: 'testUsername',
    email: 'testemail@domain.com',

    sessionToken: [],

    accessToken: 'testAccessToken',
    refreshToken: 'testRefreshToken',

    suppressNewCacheFeature: false,
    enableNotificationFeature: false,
});
