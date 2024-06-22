import * as Factory from 'factory.ts';
import moment from 'moment';
import { ObjectId } from 'mongodb';

import { Subscription } from '../shared-models';

import randomStringFactory from './random-string-factory';


export const subscriptionFactory = Factory.Sync.makeFactory<Subscription>({
    id: Factory.each(() => randomStringFactory(22)),
    createdAt: moment().toDate(),
    updatedAt: moment().toDate(),

    endpoint: `https://fcm.googleapis.com/fcm/send/${randomStringFactory(152)}`,
    keys: {
        p256dh: randomStringFactory(87),
        auth: randomStringFactory(22),
    },

    userId: Factory.each(() => new ObjectId()),
});
